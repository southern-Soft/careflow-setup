"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X, Code, Database, Wifi, AlertCircle, Terminal,
  Zap, HardDrive, Settings, Trash2, Copy, Check,
  ArrowRight, Eye, EyeOff, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

export function DevTools() {
  const [isVisible, setIsVisible] = useState(false);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [apiEndpoint, setApiEndpoint] = useState("/api/v1/auth/me");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  // Listen for Ctrl+Shift+D to toggle dev panel
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+Shift+D or Cmd+Shift+D
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Load data when panel opens
  useEffect(() => {
    if (isVisible) {
      checkApiStatus();
      loadLocalStorage();
      loadPerformanceMetrics();
    } else {
      // Clear data when panel closes to free memory
      setApiResponse(null);
      setLocalStorageData({});
      setPerformanceMetrics(null);
    }
  }, [isVisible]);

  const checkApiStatus = async () => {
    setApiStatus("checking");
    try {
      const response = await fetch(`/api/v1/auth/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      setApiStatus(response.ok ? "online" : "offline");
    } catch (error) {
      setApiStatus("offline");
    }
  };

  const testApiEndpoint = async () => {
    setIsTestingApi(true);
    try {
      const response = await fetch(`${apiEndpoint}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setApiResponse({
        status: response.status,
        statusText: response.statusText,
        data: data,
      });
    } catch (error: any) {
      setApiResponse({
        status: "Error",
        statusText: error.message,
        data: null,
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  const loadLocalStorage = () => {
    const data: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key);
      }
    }
    setLocalStorageData(data);
  };

  const loadPerformanceMetrics = () => {
    if (typeof window !== "undefined" && window.performance) {
      const navigation = window.performance.getEntriesByType("navigation")[0] as any;
      setPerformanceMetrics({
        domContentLoaded: Math.round(navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart),
        loadComplete: Math.round(navigation?.loadEventEnd - navigation?.loadEventStart),
        domInteractive: Math.round(navigation?.domInteractive),
        memory: (performance as any).memory ? {
          usedJSHeapSize: ((performance as any).memory.usedJSHeapSize / 1048576).toFixed(2),
          totalJSHeapSize: ((performance as any).memory.totalJSHeapSize / 1048576).toFixed(2),
        } : null,
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-[500px] animate-in slide-in-from-bottom-5">
      <Card className="border-2 border-primary/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-2xl">
        <div className="flex items-center justify-between border-b p-3 bg-primary/10">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <h3 className="font-semibold text-sm">Developer Tools</h3>
            <span className="text-xs text-muted-foreground">
              (Ctrl+Shift+D)
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="perf">Performance</TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {/* Environment Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium">
                <AlertCircle className="h-3 w-3" />
                Environment
              </div>
              <div className="pl-5 text-xs text-muted-foreground space-y-1">
                <div>Mode: <span className="font-mono bg-muted px-1 rounded">{process.env.NODE_ENV}</span></div>
                <div>Next.js: <span className="font-mono bg-muted px-1 rounded">15.5.2</span></div>
                <div>React: <span className="font-mono bg-muted px-1 rounded">19.0.0</span></div>
              </div>
            </div>

            {/* API Status */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Database className="h-3 w-3" />
                Backend API
              </div>
              <div className="pl-5 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  apiStatus === "online" ? "bg-green-500" :
                  apiStatus === "offline" ? "bg-red-500" :
                  "bg-yellow-500 animate-pulse"
                }`} />
                <span className="text-xs text-muted-foreground">
                  {apiStatus === "online" ? "Connected" :
                   apiStatus === "offline" ? "Disconnected" :
                   "Checking..."}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-xs"
                  onClick={checkApiStatus}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <div className="pl-5 text-xs text-muted-foreground">
                URL: <span className="font-mono bg-muted px-1 rounded">/api/v1 (proxied)</span>
              </div>
            </div>

            {/* Network Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Wifi className="h-3 w-3" />
                Frontend Server
              </div>
              <div className="pl-5 text-xs text-muted-foreground space-y-1">
                <div>Host: <span className="font-mono bg-muted px-1 rounded">{window.location.hostname}</span></div>
                <div>Port: <span className="font-mono bg-muted px-1 rounded">{window.location.port}</span></div>
                <div>Protocol: <span className="font-mono bg-muted px-1 rounded">{window.location.protocol}</span></div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t space-y-2">
              <div className="text-xs font-medium">Quick Actions</div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear Cache
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    console.log("LocalStorage:", localStorage);
                    console.log("User:", localStorage.getItem("user"));
                    toast.success("Logged to console");
                  }}
                >
                  <Terminal className="h-3 w-3 mr-1" />
                  Log State
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reload Page
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    loadLocalStorage();
                    loadPerformanceMetrics();
                    checkApiStatus();
                    toast.success("Data refreshed");
                  }}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Refresh All
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* API Tester Tab */}
          <TabsContent value="api" className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="text-xs font-medium">API Endpoint Tester</div>
              <div className="flex gap-2">
                <Input
                  placeholder="/api/v1/..."
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  className="text-xs h-8"
                />
                <Button
                  size="sm"
                  className="h-8 text-xs"
                  onClick={testApiEndpoint}
                  disabled={isTestingApi}
                >
                  {isTestingApi ? "Testing..." : "Test"}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>

            {apiResponse && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium">Response</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => copyToClipboard(JSON.stringify(apiResponse, null, 2))}
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="bg-muted p-2 rounded text-xs font-mono max-h-64 overflow-auto">
                  <div className="mb-2">
                    Status: <span className={apiResponse.status === 200 ? "text-green-600" : "text-red-600"}>
                      {apiResponse.status} {apiResponse.statusText}
                    </span>
                  </div>
                  <pre>{JSON.stringify(apiResponse.data, null, 2)}</pre>
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <div className="text-xs font-medium mb-2">Quick Endpoints</div>
              <div className="space-y-1">
                {[
                  "/api/v1/auth/me",
                  "/api/v1/buyers/",
                  "/api/v1/samples/styles",
                  "/api/v1/users/",
                ].map((endpoint) => (
                  <Button
                    key={endpoint}
                    variant="ghost"
                    size="sm"
                    className="h-7 w-full justify-start text-xs font-mono"
                    onClick={() => {
                      setApiEndpoint(endpoint);
                      toast.success("Endpoint set");
                    }}
                  >
                    {endpoint}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium">LocalStorage ({Object.keys(localStorageData).length} items)</div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={loadLocalStorage}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {Object.keys(localStorageData).length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-4">
                  No data in localStorage
                </div>
              ) : (
                Object.entries(localStorageData).map(([key, value]) => (
                  <div key={key} className="border rounded p-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-medium">{key}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => {
                            setShowToken(!showToken);
                          }}
                        >
                          {key === "token" && !showToken ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => copyToClipboard(value as string)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-red-600"
                          onClick={() => {
                            localStorage.removeItem(key);
                            loadLocalStorage();
                            toast.success(`Removed ${key}`);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs font-mono bg-muted p-1 rounded break-all">
                      {key === "token" && !showToken
                        ? "••••••••••••••••"
                        : `${String(value || "").substring(0, 100)}${String(value || "").length > 100 ? "..." : ""}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="perf" className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium">Performance Metrics</div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={loadPerformanceMetrics}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>

            {performanceMetrics && (
              <div className="space-y-2">
                <div className="border rounded p-2">
                  <div className="text-xs font-medium mb-1">Loading Times</div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>DOM Content Loaded: <span className="font-mono">{performanceMetrics.domContentLoaded}ms</span></div>
                    <div>Load Complete: <span className="font-mono">{performanceMetrics.loadComplete}ms</span></div>
                    <div>DOM Interactive: <span className="font-mono">{performanceMetrics.domInteractive}ms</span></div>
                  </div>
                </div>

                {performanceMetrics.memory && (
                  <div className="border rounded p-2">
                    <div className="text-xs font-medium mb-1">Memory Usage</div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>Used: <span className="font-mono">{performanceMetrics.memory.usedJSHeapSize} MB</span></div>
                      <div>Total: <span className="font-mono">{performanceMetrics.memory.totalJSHeapSize} MB</span></div>
                    </div>
                  </div>
                )}

                <div className="border rounded p-2">
                  <div className="text-xs font-medium mb-1">Page Info</div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>URL: <span className="font-mono break-all">{window.location.href}</span></div>
                    <div>Referrer: <span className="font-mono">{document.referrer || "Direct"}</span></div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="border-t p-2 bg-muted/50">
          <p className="text-[10px] text-muted-foreground italic text-center">
            Development mode only • Press Ctrl+Shift+D to toggle
          </p>
        </div>
      </Card>
    </div>
  );
}
