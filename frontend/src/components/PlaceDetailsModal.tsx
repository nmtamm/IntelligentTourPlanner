import React, { useState, useEffect } from "react";
import { X, MapPin, Star, Clock, ExternalLink, Trash2, Wallet } from "lucide-react";
import { Button } from "./ui/button";
import { Destination, Place } from "../types";
import { t } from "../locales/translations";
import { useThemeColors } from "../hooks/useThemeColors";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { parseAmount } from "../utils/parseAmount";
interface PlaceDetailsModalProps {
  place: Destination | null;
  isOpen?: boolean;
  onClose: () => void;
  language: "EN" | "VI";
  onAddToDay?: (place: Destination) => void;
  showAddButton?: boolean;
  onDelete?: (placeId: string) => void;
  showDeleteButton?: boolean;
  currency: "USD" | "VND";
  currentDayNumber?: number;
  detailedDestination?: Place | null;
}
export function PlaceDetailsModal({
  place,
  isOpen,
  onClose,
  language,
  onAddToDay,
  showAddButton = false,
  onDelete,
  showDeleteButton = false,
  currency,
  currentDayNumber,
  detailedDestination
}: PlaceDetailsModalProps) {
  if (!isOpen || !place) return null;

  const lang = language.toLowerCase() as "en" | "vi";
  const { primary, secondary, light } = useThemeColors();
  const currencySymbol = currency === 'USD' ? 'USD' : 'VND';
  const [translatedDetails, setTranslatedDetails] = useState<Record<string, string>>({});
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const hasValidCoords =
    typeof place.latitude === "number" &&
    typeof place.longitude === "number" &&
    !isNaN(place.latitude) &&
    !isNaN(place.longitude);

  const defaultCenter: [number, number] = [10.770048, 106.699707];
  const mapCenter: [number, number] = hasValidCoords
    ? [place.latitude, place.longitude]
    : defaultCenter;

  function MapCenterUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
      map.setView(center);
    }, [center, map]);
    return null;
  }
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        style={{ backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full h-[90vh] overflow-hidden pointer-events-auto animate-modal-appear"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: "modalAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ border: `2px solid ${primary}` }}
          >
            <X className="w-5 h-5" style={{ color: primary }} />
          </button>

          {/* Content */}
          <div className="flex flex-col md:flex-row h-full">
            {/* Left Side - Thumbnail and Map (Stacked Vertically) */}
            <div
              className="w-full md:w-1/2 bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex flex-col gap-4 overflow-y-auto"
              style={{ height: "100%" }}
            >
              {/* Thumbnail Image */}
              {detailedDestination?.thumbnail && (
                <div className="w-full h-64 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={`/assets/${detailedDestination.place_id}.jpg`}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Map */}
              <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <div className="relative w-full h-full flex items-center justify-center">
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <MapCenterUpdater center={mapCenter} />
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {hasValidCoords && (
                      <Marker position={mapCenter}>
                        <Popup>
                          {language === "EN"
                            ? (detailedDestination && Array.isArray(detailedDestination.en_names)
                              ? detailedDestination.en_names[0]
                              : (detailedDestination?.en_names || place.name))
                            : (detailedDestination && Array.isArray(detailedDestination.vi_names)
                              ? detailedDestination.vi_names[0]
                              : (detailedDestination?.vi_names || place.name))}
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              </div>
            </div>

            {/* Right Side - Details (Scrollable) */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto h-full">
              <div className="space-y-4">
                {/* Place Name */}
                <h2 className="text-gray-900 text-2xl">
                  {language === "EN"
                    ? (detailedDestination && Array.isArray(detailedDestination.en_names)
                      ? detailedDestination.en_names[0]
                      : (detailedDestination?.en_names || place.name))
                    : (detailedDestination && Array.isArray(detailedDestination.vi_names)
                      ? detailedDestination.vi_names[0]
                      : (detailedDestination?.vi_names || place.name))}
                </h2>

                {/* Place Type */}
                {language === "EN" && detailedDestination?.best_type_id_en && (
                  <div>
                    <span
                      className="inline-block text-sm px-3 py-1.5 rounded-lg"
                      style={{
                        backgroundColor: light,
                        color: primary,
                      }}
                    >
                      {detailedDestination.best_type_id_en.charAt(0).toUpperCase() + detailedDestination.best_type_id_en.slice(1)}
                    </span>
                  </div>
                )}

                {language === "VI" && detailedDestination?.best_type_id_vi && (
                  <div>
                    <span
                      className="inline-block text-sm px-3 py-1.5 rounded-lg"
                      style={{
                        backgroundColor: light,
                        color: primary,
                      }}
                    >
                      {detailedDestination.best_type_id_vi.charAt(0).toUpperCase() + detailedDestination.best_type_id_vi.slice(1)}
                    </span>
                  </div>
                )}

                {/* Rating & Review Count */}
                {detailedDestination?.rating && (
                  <div className="flex items-center gap-2">
                    {/* Rating Badge */}
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ backgroundColor: primary }}
                    >
                      <span className="text-white text-sm">
                        {detailedDestination.rating.toFixed(1)}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, index) => {
                          const starPosition = index + 1; // 1-based star position (1, 2, 3, 4, 5)
                          const rating = detailedDestination?.rating !== undefined && detailedDestination?.rating !== null
                            ? detailedDestination.rating
                            : 4.5;

                          // Calculate fill percentage for this star (0-100)
                          const fillPercent = Math.max(0, Math.min(100, (rating - index) * 100));

                          // Determine star state
                          const isFilled = fillPercent === 100;
                          const isEmpty = fillPercent === 0;
                          const isPartial = fillPercent > 0 && fillPercent < 100;

                          return (
                            <div key={starPosition} className="relative w-4 h-4">
                              {isPartial ? (
                                /* Partial Star: Overlay technique for precise decimal fill */
                                <>
                                  {/* Base: Empty gray star */}
                                  <Star
                                    className="w-4 h-4 absolute inset-0 transition-all duration-150"
                                    fill="#E5E7EB"
                                    stroke="#E5E7EB"
                                    strokeWidth={1.5}
                                  />
                                  {/* Overlay: Yellow star clipped to exact percentage */}
                                  <div
                                    className="absolute inset-0 overflow-hidden transition-all duration-150"
                                    style={{
                                      width: `${fillPercent}%`,
                                    }}
                                  >
                                    <Star
                                      className="w-4 h-4 absolute left-0 top-0"
                                      fill="#FACC15"
                                      stroke="#FACC15"
                                      strokeWidth={1.5}
                                    />
                                  </div>
                                </>
                              ) : (
                                /* Full or Empty Star: Simple single icon */
                                <Star
                                  className="w-4 h-4 transition-all duration-150"
                                  fill={isFilled ? "#FACC15" : "#E5E7EB"}
                                  stroke={isFilled ? "#FACC15" : "#E5E7EB"}
                                  strokeWidth={1.5}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Review Count */}
                    {detailedDestination?.reviews && (
                      <span className="text-sm text-gray-600">
                        ({detailedDestination?.reviews.toLocaleString()}{" "}
                        {language === "EN" ? "reviews" : "đánh giá"})
                      </span>
                    )}
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* Address */}
                {place.address && (
                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPin className="w-5 h-5 mt-0.5 shrink-0" style={{ color: primary }} />
                    <span className="text-sm">{place.address}</span>
                  </div>
                )}

                {/* Open Hours */}
                {detailedDestination?.hours && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="w-5 h-5 shrink-0" style={{ color: primary }} />
                    <span className="text-sm">
                      {(detailedDestination.hours ?? "")
                        .split("·")
                        .map((part, idx, arr) => (
                          <React.Fragment key={idx}>
                            {part.trim()}
                            {idx < arr.length - 1 && <br />}
                          </React.Fragment>
                        ))}
                    </span>
                  </div>
                )}

                {/* Price Level */}
                {detailedDestination?.price && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Wallet className="w-4 h-4" />
                    {(() => {
                      const parsed = parseAmount(detailedDestination.price);
                      return parsed.isApprox && parsed.min !== parsed.max
                        ? `${parsed.min.toLocaleString()} \u2013 ${parsed.max.toLocaleString()}`
                        : parsed.min.toLocaleString();
                    })()} {currencySymbol}
                  </div>
                )}

                {/* Detailed Information */}
                {language === "EN" && detailedDestination?.place_detail_en && (
                  <div className="flex flex-col gap-3 text-gray-700">
                    <div style={{ color: "#2563eb", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                      Details
                    </div>
                    {Object.entries(detailedDestination.place_detail_en).map(([field, content]) => (
                      <div key={field} style={{ marginBottom: 12 }}>
                        <div style={{ color: "#2563eb", fontWeight: 600 }}>
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </div>
                        <div style={{ color: "#111" }}>{content}</div>
                      </div>
                    ))}
                  </div>
                )}
                {language === "VI" && detailedDestination?.place_detail_vi && (
                  <div className="flex flex-col gap-3 text-gray-700">
                    <div style={{ color: "#2563eb", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                      Thông tin chi tiết
                    </div>
                    {Object.entries(detailedDestination.place_detail_vi).map(([field, content]) => (
                      <div key={field} style={{ marginBottom: 12 }}>
                        <div style={{ color: "#2563eb", fontWeight: 600 }}>
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </div>
                        <div style={{ color: "#111" }}>{content}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {/* Website Link */}
                  {detailedDestination?.website && (
                    <Button
                      variant="outline"
                      className="flex-1 relative overflow-hidden group transition-all duration-200"
                      onClick={() => window.open(detailedDestination.website, "_blank")}
                      style={{
                        borderColor: primary,
                        borderWidth: "2px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = `0 8px 20px ${primary}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" style={{ color: primary }} />
                      <span style={{ color: primary }}>
                        {language === "EN" ? "Website" : "Trang web"}
                      </span>
                    </Button>
                  )}

                  {/* Add to Day Button */}
                  {showAddButton && onAddToDay && (
                    <Button
                      className="flex-1 relative overflow-hidden group transition-all duration-200"
                      onClick={() => onAddToDay(place)}
                      style={{
                        backgroundColor: secondary,
                        color: "white",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = `0 8px 20px ${secondary}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {currentDayNumber
                        ? (language === "EN"
                          ? `Add to Day ${currentDayNumber}`
                          : `Thêm vào Ngày ${currentDayNumber}`)
                        : t("addToDay", lang)
                      }
                    </Button>
                  )}


                  {/* Delete Button */}
                  {showDeleteButton && onDelete && (
                    <Button
                      className="flex-1 relative overflow-hidden group transition-all duration-200"
                      onClick={() => onDelete(place.id)}
                      style={{
                        backgroundColor: "red",
                        color: "white",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = `0 8px 20px red40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" style={{ color: "white" }} />
                      {t("delete", lang)}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>
        {`
          @keyframes modalAppear {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}
      </style>
    </>
  );
}