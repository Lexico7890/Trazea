import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { FeaturesTab } from "./FeaturesTab";
import { FilesTab } from "./FilesTab";

export function DocumentationPage() {
  return (
    <div className="p-4 md:p-6 w-full max-w-6xl mx-auto min-h-[80vh] flex flex-col animate-fade-in">
      <h1 className="text-3xl font-bold orbitron-title text-white mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] tracking-wide">
        Documentación
      </h1>
      
      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-xl p-1 h-auto">
          <TabsTrigger 
            value="features" 
            className="py-3 data-[state=active]:bg-[#2ecc71]/20 data-[state=active]:text-[#2ecc71] data-[state=active]:shadow-[0_0_15px_rgba(46,204,113,0.3)] transition-all duration-300 rounded-lg text-sm md:text-base font-semibold"
          >
            Funcionalidades
          </TabsTrigger>
          <TabsTrigger 
            value="files" 
            className="py-3 data-[state=active]:bg-[#2ecc71]/20 data-[state=active]:text-[#2ecc71] data-[state=active]:shadow-[0_0_15px_rgba(46,204,113,0.3)] transition-all duration-300 rounded-lg text-sm md:text-base font-semibold"
          >
            Gestor de Archivos
          </TabsTrigger>
        </TabsList>
        <TabsContent value="features" className="focus-visible:outline-none focus-visible:ring-0">
          <FeaturesTab />
        </TabsContent>
        <TabsContent value="files" className="focus-visible:outline-none focus-visible:ring-0">
          <FilesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
