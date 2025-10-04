
'use client';

import { useEffect, useRef, useState }from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Loader2, ChevronDown, MapPin, Route, Shapes, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface Placemark {
  id: string;
  name: string;
  type: 'Point' | 'LineString' | 'Polygon' | 'Unknown';
  coordinates: google.maps.LatLngLiteral[];
  bounds: google.maps.LatLngBounds;
}

// A more robust KML parser function
function parseKML(kmlString: string): Placemark[] {
    const parser = new DOMParser();
    const kml = parser.parseFromString(kmlString, 'application/xml');
    const placemarks: Placemark[] = [];
    const placemarkNodes = kml.getElementsByTagName('Placemark');

    for (let i = 0; i < placemarkNodes.length; i++) {
        const node = placemarkNodes[i];
        const name = node.getElementsByTagName('name')[0]?.textContent || `Placemark ${i + 1}`;
        
        let type: Placemark['type'] = 'Unknown';
        let coordNodes;

        const point = node.getElementsByTagName('Point')[0];
        const line = node.getElementsByTagName('LineString')[0];
        const polygon = node.getElementsByTagName('Polygon')[0];

        if (point) {
            type = 'Point';
            coordNodes = point.getElementsByTagName('coordinates')[0];
        } else if (line) {
            type = 'LineString';
            coordNodes = line.getElementsByTagName('coordinates')[0];
        } else if (polygon) {
            type = 'Polygon';
            // For polygons, we look inside outerBoundaryIs > LinearRing
            const outerBoundary = polygon.getElementsByTagName('outerBoundaryIs')[0];
            const linearRing = outerBoundary?.getElementsByTagName('LinearRing')[0];
            coordNodes = linearRing?.getElementsByTagName('coordinates')[0];
        }
        
        if (coordNodes) {
            const coordsText = coordNodes.textContent;
            if (coordsText) {
                const points = coordsText.trim().split(/\s+/).map(pointStr => {
                    const [lng, lat] = pointStr.split(',').map(Number);
                    return { lat, lng };
                }).filter(p => !isNaN(p.lat) && !isNaN(p.lng));

                if (points.length > 0) {
                    const bounds = new google.maps.LatLngBounds();
                    points.forEach(p => bounds.extend(p));
                    placemarks.push({
                        id: `placemark-${i}`,
                        name,
                        type,
                        coordinates: points,
                        bounds
                    });
                }
            }
        }
    }
    return placemarks;
}

function getIconForType(type: Placemark['type']) {
    switch (type) {
        case 'Point': return <MapPin className="h-4 w-4 mr-2" />;
        case 'LineString': return <Route className="h-4 w-4 mr-2" />;
        case 'Polygon': return <Shapes className="h-4 w-4 mr-2" />;
        default: return <MapPin className="h-4 w-4 mr-2" />;
    }
}


export default function KmlViewerPage() {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [placemarks, setPlacemarks] = useState<Placemark[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlacemarksLoading, setIsPlacemarksLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isMapInitialized = useRef(false);

    useEffect(() => {
        if (isMapInitialized.current) return;
        isMapInitialized.current = true;

        const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!GOOGLE_MAPS_API_KEY) {
            const errorMessage = "Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file.";
            console.error(errorMessage);
            setError(errorMessage);
            setIsLoading(false);
            setIsPlacemarksLoading(false);
            return;
        }
        
        const loader = new Loader({
            apiKey: GOOGLE_MAPS_API_KEY,
            version: 'weekly',
        });

        loader.load().then(() => {
            if (!mapRef.current) return;
            
            const mapInstance = new google.maps.Map(mapRef.current, {
                zoom: 5,
                center: { lat: 26.8, lng: 80.9 }, // Centered on India
                mapTypeControl: true,
                mapTypeControlOptions: {
                  style: google.maps.MapTypeControlStyle.DEFAULT,
                  position: google.maps.ControlPosition.RIGHT_TOP,
                },
                streetViewControl: false,
            });
            setMap(mapInstance);
            setIsLoading(false);
            
            const kmlContent = sessionStorage.getItem('kmlContent');
            if (kmlContent) {
                try {
                    const parsedPlacemarks = parseKML(kmlContent);
                    setPlacemarks(parsedPlacemarks);
                    setIsPlacemarksLoading(false);
                    const overallBounds = new google.maps.LatLngBounds();

                    parsedPlacemarks.forEach(placemark => {
                        overallBounds.union(placemark.bounds);

                        if (placemark.type === 'Point') {
                            new google.maps.Marker({
                                position: placemark.coordinates[0],
                                map: mapInstance,
                                title: placemark.name,
                            });
                        } else if (placemark.type === 'LineString') {
                            new google.maps.Polyline({
                                path: placemark.coordinates,
                                map: mapInstance,
                                strokeColor: '#FF0000',
                                strokeOpacity: 1.0,
                                strokeWeight: 2,
                            });
                        } else if (placemark.type === 'Polygon') {
                            new google.maps.Polygon({
                                paths: placemark.coordinates,
                                map: mapInstance,
                                strokeColor: '#0000FF',
                                strokeOpacity: 0.8,
                                strokeWeight: 2,
                                fillColor: '#0000FF',
                                fillOpacity: 0.35,
                            });
                        }
                    });
                    
                    if (!overallBounds.isEmpty()) {
                        mapInstance.fitBounds(overallBounds);
                    }
                } catch (e) {
                    setError("Failed to parse KML data. Please check the file format.");
                    setIsPlacemarksLoading(false);
                }

            } else {
                setError('No KML data found in session. Please upload a file first.');
                setIsPlacemarksLoading(false);
            }
        }).catch(e => {
            console.error("Failed to initialize map or load KML:", e);
            setError("Failed to load Google Maps. Please check your API key and ensure the Maps JavaScript API is enabled in your Google Cloud console.");
            setIsLoading(false);
            setIsPlacemarksLoading(false);
        });

    }, []);

    const zoomToPlacemark = (placemark: Placemark) => {
        if (map) {
            map.fitBounds(placemark.bounds);
             // Add a small zoom out after fitting bounds if it's too close
            const listener = google.maps.event.addListener(map, 'idle', function() { 
                if (map.getZoom()! > 15) map.setZoom(15); 
                google.maps.event.removeListener(listener); 
            });
        }
    };

    return (
        <div className='flex h-screen w-screen bg-background'>
            <aside className='w-full max-w-xs flex flex-col border-r'>
                 <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Placemarks</h2>
                 </div>
                 <ScrollArea className="flex-1">
                    {isPlacemarksLoading ? (
                        <div className="flex items-center justify-center h-full p-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : placemarks.length > 0 ? (
                        <ul className="space-y-1 p-2">
                            {placemarks.map(p => (
                                <li key={p.id}>
                                    <Button 
                                        variant="ghost" 
                                        className="w-full justify-start text-left h-auto py-2"
                                        onClick={() => zoomToPlacemark(p)}
                                    >
                                        {getIconForType(p.type)}
                                        <span className="flex-1 truncate">{p.name}</span>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center p-4">No placemarks found in KML file.</p>
                    )}
                </ScrollArea>
            </aside>
            <main className='flex-1 h-full relative'>
                 {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background z-20">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                            <p>Loading map...</p>
                        </div>
                    </div>
                )}
                 {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background z-20 p-8">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Map Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </div>
                 )}
                 <div ref={mapRef} id="map" className='h-full w-full'></div>
            </main>
        </div>
    );
}
