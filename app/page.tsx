"use client";

import { useState } from "react";
import { Download, Link as LinkIcon, Loader2, AlertCircle, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setProgress({ current: 0, total: 0 });

    try {
      const response = await fetch("/api/download-property", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al procesar la URL");
      }

      // Obtener el blob del ZIP
      const blob = await response.blob();
      
      // Crear URL temporal y descargar
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      
      // Generar nombre de archivo desde la URL
      const urlParts = url.split("/");
      const lastPart = urlParts[urlParts.length - 1] || "propiedad";
      link.download = `propiedad_${lastPart}.zip`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setSuccess(true);
      setUrl("");
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error downloading:", error);
      setError(error instanceof Error ? error.message : "Error al procesar la URL");
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl">
        <Card className="p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Descargar Propiedad
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Ingresa el link de una propiedad de Wasi o Remax para descargar
              <br />
              todas las imágenes en alta calidad y las especificaciones en un ZIP
            </p>
          </div>

          <form onSubmit={handleDownload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                URL de la Propiedad <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://info.wasi.co/... o https://remaxhabitat.com/..."
                  className="flex-1"
                  required
                  disabled={loading}
                />
                <Button
                  type="submit"
                  variant="default"
                  disabled={loading || !url}
                  className="w-full sm:w-auto min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Procesando...</span>
                      <span className="sm:hidden">Procesando</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Descargar</span>
                      <span className="sm:hidden">Descargar</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Soporta URLs de remaxhabitat.com, wasi.co e info.wasi.co
              </p>
            </div>

            {loading && progress.total > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-700">Procesando imágenes...</span>
                  <span className="text-sm font-medium text-slate-900">
                    {progress.current} / {progress.total}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(progress.current / progress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">¡Descarga completada!</p>
                  <p className="text-sm text-green-700">
                    El archivo ZIP se ha descargado exitosamente.
                  </p>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>
    </main>
  );
}
