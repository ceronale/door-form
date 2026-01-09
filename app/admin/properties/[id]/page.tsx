"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import PropertyForm from "@/components/admin/PropertyForm";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ArrowLeft, Trash2, ExternalLink, Copy, Check, Download } from "lucide-react";
import PropertyImageSlider from "@/components/admin/PropertyImageSlider";
import { copyToClipboard, downloadImage, downloadMultipleImages, downloadImagesAsZip } from "@/lib/utils/copy-download";
import { getHighQualityWasiImage } from "@/lib/utils/image-quality";

interface Property {
  id: string;
  title: string;
  wasi_url: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  price: number;
  location: string;
  address: string | null;
  description: string | null;
  images: string[] | null;
  is_active: boolean;
  created_at: string;
}

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [downloadingImages, setDownloadingImages] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        setProperty(data);
      }
    } catch (error) {
      console.error("Error fetching property:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = useCallback(async () => {
    if (!confirm("¿Estás seguro de eliminar esta propiedad?")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/properties");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
    } finally {
      setDeleting(false);
    }
  }, [propertyId, router]);

  // Insertar botones en la TopBar usando useEffect (debe estar antes de los returns)
  useEffect(() => {
    const topbarActions = document.getElementById('topbar-actions');
    if (!topbarActions) return;

    // Limpiar primero
    topbarActions.innerHTML = '';

    // Solo insertar botones si no estamos en modo de edición y tenemos una propiedad
    if (showForm || !property) {
      return;
    }

    // Crear contenedor para los botones
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'flex items-center gap-2';
    
    const editButton = document.createElement('button');
    editButton.className = 'px-3 py-1.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 active:bg-slate-700 transition-colors font-medium';
    editButton.textContent = 'Editar';
    editButton.style.zIndex = '50';
    editButton.addEventListener('click', (e) => {
      e.stopPropagation();
      setShowForm(true);
    });

    const deleteButton = document.createElement('button');
    deleteButton.className = `px-3 py-1.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 active:bg-slate-700 transition-colors flex items-center gap-2 font-medium ${deleting ? 'opacity-50 cursor-not-allowed' : ''}`;
    deleteButton.disabled = deleting;
    deleteButton.style.zIndex = '50';
    deleteButton.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
      <span class="hidden sm:inline">${deleting ? 'Eliminando...' : 'Eliminar'}</span>
    `;
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!deleting) {
        handleDelete();
      }
    });

    buttonsContainer.appendChild(editButton);
    buttonsContainer.appendChild(deleteButton);
    topbarActions.appendChild(buttonsContainer);

    return () => {
      topbarActions.innerHTML = '';
    };
  }, [deleting, handleDelete, setShowForm, showForm, property]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-600">Cargando propiedad...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-600">Propiedad no encontrada</p>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(false)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
        <PropertyForm
          property={property}
          onCancel={() => {
            setShowForm(false);
            fetchProperty();
          }}
        />
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCopyText = async (text: string, fieldName: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleDownloadAllImages = async () => {
    if (!property?.images || property.images.length === 0) return;
    
    setDownloadingImages(true);
    const sanitizedTitle = property.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    try {
      await downloadMultipleImages(
        property.images,
        sanitizedTitle,
        (current, total) => {
          console.log(`Descargando ${current} de ${total}`);
        }
      );
    } catch (error) {
      console.error('Error downloading images:', error);
    } finally {
      setDownloadingImages(false);
    }
  };

  const handleDownloadImagesAsZip = async () => {
    if (!property?.images || property.images.length === 0) return;
    
    setDownloadingZip(true);
    const sanitizedTitle = property.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    try {
      await downloadImagesAsZip(
        property.images,
        sanitizedTitle,
        (current, total) => {
          console.log(`Preparando ZIP: ${current} de ${total} imágenes`);
        },
        getHighQualityWasiImage // Mejorar calidad de las imágenes
      );
    } catch (error) {
      console.error('Error creating ZIP:', error);
      alert('Error al crear el archivo ZIP. Intenta descargar las imágenes individualmente.');
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Título centrado */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 break-words">
            {property.title}
          </h1>
          <button
            onClick={() => handleCopyText(property.title, 'title')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            title="Copiar título"
          >
            {copiedField === 'title' ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Copy className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Slider de Imágenes Optimizado para Móvil */}
          {property.images && property.images.length > 0 && (
            <Card className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Imágenes ({property.images.length})
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadImagesAsZip}
                    disabled={downloadingZip || downloadingImages}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Descargar todas las imágenes en un ZIP"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {downloadingZip ? 'Creando ZIP...' : 'Descargar ZIP'}
                    </span>
                    <span className="sm:hidden">
                      {downloadingZip ? '...' : 'ZIP'}
                    </span>
                  </button>
                  <button
                    onClick={handleDownloadAllImages}
                    disabled={downloadingImages || downloadingZip}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 active:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Descargar todas las imágenes individualmente"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {downloadingImages ? 'Descargando...' : 'Individual'}
                    </span>
                    <span className="sm:hidden">
                      {downloadingImages ? '...' : 'Indiv'}
                    </span>
                  </button>
                </div>
              </div>
              <PropertyImageSlider
                images={property.images}
                title={property.title}
              />
            </Card>
          )}

          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
              Información General
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-600">
                    Tipo de Propiedad
                  </p>
                  <button
                    onClick={() => handleCopyText(property.property_type, 'property_type')}
                    className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                    title="Copiar tipo de propiedad"
                  >
                    {copiedField === 'property_type' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                </div>
                <p className="text-lg font-bold text-slate-900">
                  {property.property_type}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs sm:text-sm font-medium text-slate-600">
                      Habitaciones
                    </p>
                    <button
                      onClick={() => handleCopyText(property.bedrooms.toString(), 'bedrooms')}
                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                      title="Copiar"
                    >
                      {copiedField === 'bedrooms' ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-slate-900">
                    {property.bedrooms}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs sm:text-sm font-medium text-slate-600">
                      Baños
                    </p>
                    <button
                      onClick={() => handleCopyText(property.bathrooms.toString(), 'bathrooms')}
                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                      title="Copiar"
                    >
                      {copiedField === 'bathrooms' ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-slate-900">
                    {property.bathrooms}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs sm:text-sm font-medium text-slate-600">
                      Estacionamiento
                    </p>
                    <button
                      onClick={() => handleCopyText(property.parking.toString(), 'parking')}
                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                      title="Copiar"
                    >
                      {copiedField === 'parking' ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-slate-900">
                    {property.parking}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-600">
                    Precio
                  </p>
                  <button
                    onClick={() => handleCopyText(formatCurrency(property.price), 'price')}
                    className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                    title="Copiar precio"
                  >
                    {copiedField === 'price' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(property.price)}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-600">
                    Ubicación
                  </p>
                  <button
                    onClick={() => handleCopyText(property.location, 'location')}
                    className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                    title="Copiar ubicación"
                  >
                    {copiedField === 'location' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                </div>
                <p className="text-lg text-slate-900">{property.location}</p>
              </div>

              {property.address && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-600">
                      Dirección
                    </p>
                    <button
                      onClick={() => handleCopyText(property.address!, 'address')}
                      className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                      title="Copiar dirección"
                    >
                      {copiedField === 'address' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-lg text-slate-900">{property.address}</p>
                </div>
              )}

              {property.description && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-600">
                      Descripción
                    </p>
                    <button
                      onClick={() => handleCopyText(property.description!, 'description')}
                      className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                      title="Copiar descripción"
                    >
                      {copiedField === 'description' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-slate-700 whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
              Acciones
            </h2>
            <div className="space-y-2 sm:space-y-3">
              <Button
                variant="default"
                className="w-full text-sm sm:text-base"
                onClick={() => window.open(property.wasi_url, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver en Wasi
              </Button>
              <Button
                variant="outline"
                className="w-full text-sm sm:text-base"
                onClick={() => {
                  const fullInfo = `Título: ${property.title}
Tipo: ${property.property_type}
Habitaciones: ${property.bedrooms}
Baños: ${property.bathrooms}
Estacionamiento: ${property.parking}
Precio: ${formatCurrency(property.price)}
Ubicación: ${property.location}
${property.address ? `Dirección: ${property.address}` : ''}
${property.description ? `\nDescripción:\n${property.description}` : ''}
URL: ${property.wasi_url}`;
                  handleCopyText(fullInfo, 'full_info');
                }}
              >
                {copiedField === 'full_info' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Toda la Info
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full text-sm sm:text-base"
                onClick={() => setShowForm(true)}
              >
                Editar Propiedad
              </Button>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
              Estado
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Estado</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    property.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {property.is_active ? "Activa" : "Inactiva"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

