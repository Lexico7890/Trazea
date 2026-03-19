import React, { useRef, useState, useEffect } from 'react';
import { useFeedbackStore } from '@/entities/feedback/model/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { X, Send, Image as ImageIcon, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/shared/api/supabase';
import { useUserStore } from '@/entities/user';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface FixRecord {
  id: number;
  created_at: string;
  title: string;
  text: string;
  status: string;
  images: string[] | null;
}

export default function FeedbackPage() {
  const { title, text, images, setTitle, setText, addImage, removeImage, clearFeedback } = useFeedbackStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [history, setHistory] = useState<FixRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const sessionData = useUserStore((state) => state.sessionData);
  const userId = sessionData?.user?.id;

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('fix_documentation')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data as FixRecord[] || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      toast.error('Error al cargar el historial de reportes.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;

    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processFile(file);
        }
      }
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        addImage({
          id: crypto.randomUUID(),
          dataUrl,
          name: file.name || `image-${Date.now()}`
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        processFile(files[i]);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper to convert dataUrl to Blob for upload
  const dataURLtoBlob = (dataurl: string) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)?.[1];
    let bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime || 'image/png' });
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Por favor, ingresa un título para el reporte.');
      return;
    }

    if (!text.trim() && images.length === 0) {
      toast.error('Por favor, ingresa algún texto o imagen para enviar tu reporte.');
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedImageUrls: string[] = [];

      // Clean title for URL safety
      const safeTitle = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();

      // 1. Upload Images to bucket
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const blob = dataURLtoBlob(img.dataUrl);
        const fileExt = blob.type.split('/')[1] || 'png';
        const fileName = `image-${i + 1}-${safeTitle}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('fix-documentation-images')
          .upload(fileName, blob, { contentType: blob.type });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error('Error al subir una de las imágenes.');
        }

        const { data: urlData } = supabase.storage
          .from('fix-documentation-images')
          .getPublicUrl(fileName);

        if (urlData.publicUrl) {
          uploadedImageUrls.push(urlData.publicUrl);
        }
      }

      // 2. Insert record into fix_documentation
      const { error: insertError } = await supabase
        .from('fix_documentation')
        .insert({
          title,
          text,
          images: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
          id_user_notified: userId || null,
          // status defaults to 'create' in DB
        });

      if (insertError) {
        throw new Error('Error al guardar el reporte en la base de datos.');
      }

      toast.success('¡Gracias por tus comentarios! Hemos recibido tu reporte.');
      clearFeedback();
      fetchHistory(); // Refresh history

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Ocurrió un error al enviar el feedback. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      'create': { label: 'Creado', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
      'proccess': { label: 'En proceso', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
      'ok': { label: 'Resuelto', className: 'bg-green-500/10 text-green-500 border-green-500/20' }
    };
    return configs[status] || { label: status, className: 'bg-primary/10 text-primary border-primary/20' };
  };

  return (
    <div className="container mx-auto max-w-5xl py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Feedback de la Plataforma</h1>
        <p className="text-muted-foreground mt-2">
          Ayúdanos a mejorar reportando problemas o sugiriendo nuevas características.
        </p>
      </div>

      <Tabs defaultValue="crear" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
          <TabsTrigger value="crear">Crear Fix</TabsTrigger>
          <TabsTrigger value="historial">Historial de Fixes</TabsTrigger>
        </TabsList>

        <TabsContent value="crear">
          <Card className="border-border/50 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="bg-primary/10 p-2 rounded-lg text-primary">
                  <Send className="w-5 h-5" />
                </span>
                Documentar Problema
              </CardTitle>
              <CardDescription>
                Toda la información ingresada se guardará automáticamente en tu navegador hasta que la envíes o decidas borrarla.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Título del Problema <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    placeholder="Ej: Error al intentar guardar un repuesto nuevo..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="description" className="text-sm font-medium">Descripción y Detalles</Label>
                  <div className="relative">
                    <Textarea
                      id="description"
                      placeholder="Describe el problema en detalle... (Puedes pegar imágenes directamente con Ctrl+V)"
                      className="min-h-[250px] resize-y p-4 pb-14 text-base bg-background/50 focus-visible:ring-primary/20 leading-relaxed"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onPaste={handlePaste}
                    />

                    <div className="absolute bottom-3 right-3 flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="rounded-full shadow-sm bg-background/80 backdrop-blur-sm border shadow-black/5"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="w-4 h-4 mr-2 text-primary" />
                        Adjuntar Imagen
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="mt-4 p-4 rounded-xl border bg-muted/10">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      Archivos adjuntos en proceso ({images.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {images.map((img) => (
                        <div
                          key={img.id}
                          className="group relative rounded-xl overflow-hidden border bg-muted/20 aspect-video shadow-sm"
                        >
                          <img
                            src={img.dataUrl}
                            alt={img.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="icon"
                              className="w-8 h-8 rounded-full shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-transform"
                              onClick={() => removeImage(img.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t border-border/50 py-4 flex justify-between items-center rounded-b-xl">
              <Button
                variant="ghost"
                onClick={clearFeedback}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                disabled={isSubmitting || (!text && !title && images.length === 0)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar todo
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 shadow-md rounded-full"
              >
                {isSubmitting ? 'Enviando Reporte...' : 'Enviar Reporte'}
                {!isSubmitting && <Send className="w-4 h-4 ml-2" />}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="historial">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="bg-primary/10 p-2 rounded-lg text-primary">
                  <Clock className="w-5 h-5" />
                </span>
                Historial de Reportes
              </CardTitle>
              <CardDescription>
                Lista de todos los problemas y sugerencias documentados en la plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingHistory ? (
                <div className="flex justify-center items-center py-12 text-muted-foreground">
                  Cargando historial...
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                  <CheckCircle2 className="w-12 h-12 mb-4 text-muted/50" />
                  <p>No hay reportes de problemas registrados todavía.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((record) => {
                    const statusConfig = getStatusConfig(record.status);
                    return (
                      <div key={record.id} className="p-5 border rounded-xl hover:bg-muted/10 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{record.title || 'Sin título'}</h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {format(new Date(record.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                        </p>
                        {record.text && (
                          <p className="text-sm bg-muted/30 p-3 rounded-lg border whitespace-pre-wrap">
                            {record.text}
                          </p>
                        )}

                        {record.images && record.images.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Imágenes adjuntas:</p>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {record.images.map((url, i) => (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  key={i}
                                  className="block shrink-0 w-24 h-24 rounded-lg overflow-hidden border hover:border-primary cursor-pointer transition-colors"
                                >
                                  <img src={url} alt={`Adjunto ${i + 1}`} className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
