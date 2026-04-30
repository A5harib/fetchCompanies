import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Building, MapPin, Mail, Phone, Link as LinkIcon, Briefcase } from 'lucide-react';
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function App() {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(21);
  const [techStatus, setTechStatus] = useState({});
  const fetchInitiated = useRef(new Set());

  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => prev + 21);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading]);

  useEffect(() => {
    setVisibleCount(21);
  }, [searchTerm, sortBy]);

  useEffect(() => {
    async function loadData() {
      try {
        // In Vite, assets in public/ can be fetched from root or relative to it.
        // If companies_data.json is in the root workspace folder, we might need to put it in public/
        // Wait, where is companies_data.json located? It's in the root folder of the workspace.
        // During dev, Vite serves files from the root directory, so /companies_data.json should work.
        const response = await fetch("/companies_data.json");
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load companies_data.json. Make sure the file exists in the correct location.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredCompanies = [...companies].filter(c => {
    const term = searchTerm.toLowerCase();
    const hasPositions = (c.open_positions || 0) > 0;
    return hasPositions && (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.city && c.city.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  }).sort((a, b) => {
    if (sortBy === 'name-asc') {
      return (a.name || '').localeCompare(b.name || '');
    } else if (sortBy === 'name-desc') {
      return (b.name || '').localeCompare(a.name || '');
    } else if (sortBy === 'pos-desc') {
      return (b.open_positions || 0) - (a.open_positions || 0);
    } else if (sortBy === 'pos-asc') {
      return (a.open_positions || 0) - (b.open_positions || 0);
    }
    return 0;
  });

  const visibleCompanies = filteredCompanies.slice(0, visibleCount);

  useEffect(() => {
    visibleCompanies.forEach(company => {
      const name = company.name;
      if (!name || fetchInitiated.current.has(name)) return;
      
      fetchInitiated.current.add(name);
      setTechStatus(prev => ({ ...prev, [name]: 'loading' }));

      fetch(`/proxy-jobs?company=${encodeURIComponent(name).replace(/%20/g, '+')}`)
        .then(res => res.text())
        .then(html => {
          const lowerHtml = html.toLowerCase();
          const hasJobs = html.includes('job_id=') || html.includes('/jobs/');
          const isTech = hasJobs && (
            lowerHtml.includes('software') || 
            lowerHtml.includes('fullstack') || 
            lowerHtml.includes('full stack') || 
            lowerHtml.includes('react') || 
            lowerHtml.includes('django') || 
            lowerHtml.includes('python') || 
            lowerHtml.includes('developer') ||
            lowerHtml.includes('engineer') ||
            lowerHtml.includes('programmer')
          );
          setTechStatus(prev => ({ ...prev, [name]: isTech ? 'tech' : 'non-tech' }));
        })
        .catch(() => {
          setTechStatus(prev => ({ ...prev, [name]: 'error' }));
        });
    });
  }, [visibleCompanies]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b sticky top-0 z-10 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-600/20">
              <Building size={24} />
            </div>
            Company Insights
          </h1>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full shadow-inner border border-slate-200 dark:border-slate-700">
            {loading ? "Loading data..." : `${filteredCompanies.length} Companies Found`}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative group flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Search size={20} />
            </div>
            <Input
              type="text"
              placeholder="Search by name, city or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-600 transition-all text-lg"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[240px] h-[52px] rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-base md:mt-[2px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="name-asc">Alphabetical (A-Z)</SelectItem>
              <SelectItem value="name-desc">Alphabetical (Z-A)</SelectItem>
              <SelectItem value="pos-desc">Positions (High to Low)</SelectItem>
              <SelectItem value="pos-asc">Positions (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && !error && visibleCompanies.map((company, idx) => {
            let logo = company.logo;
            if (logo && logo.includes("?")) {
              logo = logo.split("?")[0];
            }
            const finalLogo = logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name || 'Company')}&background=random&size=128`;

            return (
              <Card
                key={idx}
                className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={finalLogo}
                        alt={`${company.name} logo`}
                        className="w-full h-full object-cover bg-white"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name || "Company")}&background=eaeaea&color=666`;
                        }}
                      />
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 flex items-center gap-1 font-semibold uppercase tracking-wider text-xs"
                      >
                        <Briefcase size={12} />
                        {company.open_positions || 0} Positions
                      </Badge>
                      {techStatus[company.name] === "loading" && (
                        <Badge
                          variant="outline"
                          className="text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 text-[10px] animate-pulse"
                        >
                          Checking Tech...
                        </Badge>
                      )}
                      {techStatus[company.name] === "tech" && (
                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-0 text-[10px] uppercase tracking-wider font-bold shadow-sm shadow-blue-500/20">
                          Software House
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 transition-colors">
                    <a
                      href={`https://www.searchopal.com/jobs?keywords=${encodeURIComponent(company.name || "").replace(/%20/g, "+")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {company.name}
                    </a>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin size={14} />
                    {company.city}, {company.country}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow">
                  <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 h-10 leading-relaxed">
                    {company.description ||
                      "No description provided for this company."}
                  </p>
                </CardContent>

                <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 pb-4 flex flex-col gap-3 bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 w-full group/item hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                    <Mail
                      size={16}
                      className="text-slate-400 group-hover/item:text-blue-500 mr-2 shrink-0 transition-colors"
                    />
                    <span className="truncate">{company.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 w-full group/item hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                    <Phone
                      size={16}
                      className="text-slate-400 group-hover/item:text-green-500 mr-2 shrink-0 transition-colors"
                    />
                    <span className="truncate">{company.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center text-sm w-full group/item">
                    <LinkIcon
                      size={16}
                      className="text-slate-400 group-hover/item:text-purple-500 mr-2 shrink-0 transition-colors"
                    />
                    {company.website ? (
                      <a
                        href={`https://${company.website.replace(/^https?:\/\//, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 truncate transition-colors"
                      >
                        {company.website}
                      </a>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic">
                        No website
                      </span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        {!loading && !error && visibleCount < filteredCompanies.length && (
          <div ref={lastElementRef} className="py-8 flex justify-center mt-4 w-full">
             <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {!loading && !error && filteredCompanies.length === 0 && (
          <div className="text-center py-20 animate-in fade-in zoom-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No companies found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search criteria</p>
          </div>
        )}
      </main>
    </div>
  );
}
