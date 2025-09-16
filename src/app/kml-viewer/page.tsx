
'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { Loader2 } from 'lucide-react';

export default function KmlViewerPage() {
    const mapRef = useRef(null);
    const loadingRef = useRef(null);
    const isMapInitialized = useRef(false);

    useEffect(() => {
        const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyC8hH3cmd3-OiH4j0jn8e2i3uECyVKpk-o';
        
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
                // Create a Blob from the KML content
                const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
                // Create an object URL for the Blob
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
                        // Revoke the object URL after a short delay to ensure it's been loaded
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

        // Define initMap on the window object
        (window as any).initMap = () => {
            if (loadingRef.current) {
                (loadingRef.current as HTMLElement).style.display = 'none';
            }
             if (mapRef.current && !isMapInitialized.current) {
                isMapInitialized.current = true;
                map = new google.maps.Map(mapRef.current, {
                    zoom: 2,
                    center: { lat: 0, lng: 0 }
                });

                // Retrieve KML content from sessionStorage
                const kmlContent = sessionStorage.getItem('kmlContent');
                if (kmlContent) {
                    loadKML(kmlContent);
                    // Clear the content from storage after use
                    // sessionStorage.removeItem('kmlContent');
                } else {
                     alert('No KML data found. Please go back and upload a file.');
                }
            }
        };

        // Load the script if it's not already loaded
        if (!document.querySelector(`script[src*="maps.googleapis.com"]`)) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);

            return () => {
                // Clean up the script tag and the global function
                document.head.removeChild(script);
                delete (window as any).initMap;
            };
        } else if (typeof google !== 'undefined' && google.maps && mapRef.current && !isMapInitialized.current) {
            // If script is already there, just init the map
            (window as any).initMap();
        }

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
