import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://greyhound-predictor.com';

    // Base routes that are always present
    const routes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1.0,
        },
    ];

    try {
        // 1. Fetch live tracks to add to sitemap dynamically
        const trackRes = await fetch("http://46.225.29.192:8000/api/races/today", { cache: 'no-store' });
        if (trackRes.ok) {
            const trackData = await trackRes.json();
            const meetings = trackData.meetings || [];

            meetings.forEach((track: any) => {
                routes.push({
                    url: `${baseUrl}/track/${track.id}`,
                    lastModified: new Date(),
                    changeFrequency: 'hourly' as const,
                    priority: 0.8,
                });
            });

            // 2. Fetch the individual races for each track to map those as well
            // We do this to ensure Google indexes the specific race pages containing the AI predictions
            for (const track of meetings) {
                try {
                    const raceRes = await fetch(`http://46.225.29.192:8000/api/track/${track.id}`, { cache: 'no-store' });
                    if (raceRes.ok) {
                        const raceData = await raceRes.json();
                        const races = raceData.races || [];
                        races.forEach((race: any) => {
                            routes.push({
                                url: `${baseUrl}/race/${race.id}`,
                                lastModified: new Date(),
                                changeFrequency: 'daily' as const,
                                priority: 0.9,
                            });
                        });
                    }
                } catch (e) {
                    console.error(`Error mapping races for track ${track.id}:`, e);
                }
            }
        }
    } catch (error) {
        console.error("Sitemap generation error:", error);
    }

    return routes;
}
