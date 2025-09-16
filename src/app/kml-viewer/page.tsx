
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

        // Exit if the script is already loaded or in the process of being loaded
        if (window.google && window.google.maps) {
            if (!isMapInitialized.current) {
                initMap();
            }
            return;
        }

        if (document.getElementById(scriptId)) {
            return;
        }
        
        let map: google.maps.Map;
        let currentKmlLayer: google.maps.KmlLayer | null;

        function loadKML(kmlContent: string) {
            if (!kmlContent) {
                console.error('No KML content found in sessionStorage');
                alert('No KML data found. Please upload a file first.');
                return;
            }

            clearKML();

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
                    const bounds = currentKmlLayer!.getDefaultViewport();
                    if (bounds) {
                        map.fitBounds(bounds);
                    }
                });

                currentKmlLayer.addListener('status_changed', function() {
                    const status = currentKmlLayer!.getStatus();
                    if (status === google.maps.KmlLayerStatus.INVALID_DOCUMENT) {
                        console.error('Invalid KML document');
                        alert('Invalid KML document');
                    } else if (status === google.maps.KmlLayerStatus.DOCUMENT_NOT_FOUND) {
                        console.error('KML document not found');
                        alert('KML document not found');
                    } else if (status === google.maps.KmlLayerStatus.OK) {
                        console.log('KML loaded successfully and zoomed to bounds');
                        setTimeout(() => URL.revokeObjectURL(url), 500);
                    }
                });

            } catch (error) {
                console.error('Error loading KML:', error);
                if (error instanceof Error) {
                    alert('Error loading KML: ' + error.message);
                }
            }
        }

        function clearKML() {
            if (currentKmlLayer) {
                currentKmlLayer.setMap(null);
                currentKmlLayer = null;
            }
        }

        function initMap() {
            if (loadingRef.current) {
                loadingRef.current.style.display = 'none';
            }
            if (mapRef.current && !isMapInitialized.current) {
                isMapInitialized.current = true;
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

        // Define the callback function on the window object
        (window as any).initMap = initMap;
        
        // Create and append the script tag
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        // Cleanup function to run when the component unmounts
        return () => {
            const existingScript = document.getElementById(scriptId);
            if (existingScript) {
                document.head.removeChild(existingScript);
            }
            // It's important to remove the callback function from the window object as well
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
