
'use client';

import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Loader2 } from 'lucide-react';

// A simple KML parser function
function parseKML(kmlString: string) {
    const parser = new DOMParser();
    const kml = parser.parseFromString(kmlString, 'application/xml');
    const coordinates = [];
    const placemarks = kml.getElementsByTagName('Placemark');
    for (let i = 0; i < placemarks.length; i++) {
        const lineString = placemarks[i].getElementsByTagName('LineString')[0];
        if (lineString) {
            const coordsText = lineString.getElementsByTagName('coordinates')[0].textContent;
            if (coordsText) {
                const points = coordsText.trim().split(/\s+/).map(point => {
                    const [lng, lat] = point.split(',').map(Number);
                    return { lat, lng };
                });
                coordinates.push(points);
            }
        }
    }
    return coordinates;
}


export default function KmlViewerPage() {
    const mapRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef<HTMLDivElement>(null);
    const isMapInitialized = useRef(false);

    useEffect(() => {
        if (isMapInitialized.current) return;

        const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyC8hH3cmd3-OiH4j0jn8e2i3uECyVKpk-o';
        
        const loader = new Loader({
            apiKey: GOOGLE_MAPS_API_KEY,
            version: 'weekly',
        });

        async function initMap() {
            if (!mapRef.current) return;
            isMapInitialized.current = true;
            
            await loader.load();

            const map = new google.maps.Map(mapRef.current, {
                zoom: 5,
                center: { lat: 26.8, lng: 80.9 }, // Centered on India
            });
            
            if (loadingRef.current) {
                loadingRef.current.style.display = 'none';
            }
            
            const kmlContent = sessionStorage.getItem('kmlContent');
            if (kmlContent) {
                const paths = parseKML(kmlContent);
                const bounds = new google.maps.LatLngBounds();

                paths.forEach(path => {
                    if (path.length > 0) {
                        const polyline = new google.maps.Polyline({
                            path: path,
                            geodesic: true,
                            strokeColor: '#FF0000',
                            strokeOpacity: 1.0,
                            strokeWeight: 2,
                        });
                        polyline.setMap(map);
                        
                        // Extend bounds for each point in the path
                        path.forEach(point => bounds.extend(point));
                    }
                });
                
                // Fit map to the calculated bounds if any paths were found
                if (!bounds.isEmpty()) {
                    map.fitBounds(bounds);
                }

            } else {
                alert('No KML data found in session. Please upload a file first.');
            }
        }

        initMap().catch(e => {
            console.error("Failed to initialize map or load KML:", e);
            if(loadingRef.current) {
                loadingRef.current.innerHTML = 'Failed to load map. Please check the console.';
            }
        });

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

