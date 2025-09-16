
'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

export default function KmlViewerPage() {
    const mapRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef<HTMLDivElement>(null);
    const isMapInitialized = useRef(false);

    useEffect(() => {
        const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyC8hH3cmd3-OiH4j0jn8e2i3uECyVKpk-o';
        const scriptId = 'google-maps-script';

        let map: google.maps.Map;
        let currentKmlLayer: google.maps.KmlLayer | null = null;

        function loadKML(kmlContent: string) {
            if (!kmlContent) {
                console.error('No KML content found in sessionStorage');
                alert('No KML data found. Please upload a file first.');
                return;
            }

            if (currentKmlLayer) {
                currentKmlLayer.setMap(null);
                currentKmlLayer = null;
            }

            try {
                const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
                const url = URL.createObjectURL(blob);

                currentKmlLayer = new google.maps.KmlLayer({
                    url: url,
                    map: map,
                    suppressInfoWindows: false,
                    preserveViewport: false
                });

                currentKmlLayer.addListener('defaultviewport_changed', function() {
                    if (currentKmlLayer) {
                        const bounds = currentKmlLayer.getDefaultViewport();
                        if (bounds) {
                            map.fitBounds(bounds);
                        }
                    }
                });

                currentKmlLayer.addListener('status_changed', function() {
                    if (currentKmlLayer) {
                        const status = currentKmlLayer.getStatus();
                        if (status !== google.maps.KmlLayerStatus.OK) {
                            console.error(`KML Layer status: ${status}`);
                        } else {
                            console.log('KML loaded successfully.');
                        }
                    }
                });
                // The URL is revoked after a short delay to give the map time to process it.
                setTimeout(() => URL.revokeObjectURL(url), 1000);

            } catch (error) {
                console.error('Error loading KML:', error);
                if (error instanceof Error) {
                    alert('Error loading KML: ' + error.message);
                }
            }
        }
        
        function initMap() {
            if (mapRef.current && !isMapInitialized.current) {
                isMapInitialized.current = true;
                if (loadingRef.current) {
                    loadingRef.current.style.display = 'none';
                }

                map = new google.maps.Map(mapRef.current, {
                    zoom: 2,
                    center: { lat: 0, lng: 0 }
                });

                const kmlContent = sessionStorage.getItem('kmlContent');
                if (kmlContent) {
                    loadKML(kmlContent);
                } else {
                     alert('No KML data found. Please go back and upload a file.');
                }
            }
        };

        if (window.google && window.google.maps) {
            initMap();
        } else {
            const script = document.getElementById(scriptId) as HTMLScriptElement;
            if (script) {
                // If script is already in the DOM, it might still be loading,
                // so we attach our initMap to its load event.
                const oldCallback = (window as any).initMap;
                script.addEventListener('load', initMap);
                 if (oldCallback) {
                     script.removeEventListener('load', oldCallback);
                 }
            } else {
                // If script does not exist, create it and add it to the page.
                (window as any).initMap = initMap;
                const newScript = document.createElement('script');
                newScript.id = scriptId;
                newScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
                newScript.async = true;
                newScript.defer = true;
                document.head.appendChild(newScript);
            }
        }

        // Cleanup function to remove the global callback and potentially the script
        return () => {
            if ((window as any).initMap) {
                delete (window as any).initMap;
            }
        };
    }, []);

    return (
        <>
            <style jsx global>{`
                body, html {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                }
            `}</style>
            <div ref={loadingRef} className="loading absolute inset-0 flex items-center justify-center bg-background z-10">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading map and KML data...</p>
                </div>
            </div>
            <div ref={mapRef} id="map" style={{ height: '100vh', width: '100%' }}></div>
        </>
    );
}
