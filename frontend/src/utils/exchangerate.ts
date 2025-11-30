import { parseAmount } from "./parseAmount";

export async function convertCurrency(amount: number, source: string, target: string) {
    const res = await fetch(
        `http://localhost:8000/api/exchangerate?amount=${amount}&source=${source}&target=${target}`
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.amount;
}

export async function convertAllDays(days, currency) {
    return Promise.all(days.map(async (day) => ({
        ...day,
        destinations: await Promise.all(day.destinations.map(async (dest) => ({
            ...dest,
            costs: await Promise.all(dest.costs.map(async (cost) => {
                const sourceCurrency = cost.originalCurrency || currency;
                if (sourceCurrency !== currency) {
                    const parsed = parseAmount(cost.originalAmount || "0");
                    // Convert both min and max if it's a range
                    const convertedMin = await convertCurrency(
                        parsed.min,
                        sourceCurrency.toLowerCase(),
                        currency.toLowerCase()
                    );
                    const convertedMax = await convertCurrency(
                        parsed.max,
                        sourceCurrency.toLowerCase(),
                        currency.toLowerCase()
                    );
                    // If it's an approximate/range, return as "min-max"
                    const convertedAmount = parsed.isApprox
                        ? `${convertedMin}-${convertedMax}`
                        : String(convertedMin);
                    return { ...cost, amount: convertedAmount };
                } else {
                    return { ...cost, amount: String(cost.originalAmount) };
                }
            }))
        })))
    })));
}

export async function convertAllTrips(trips, currency) {
    return Promise.all(trips.map(async trip => ({
        ...trip,
        days: await convertAllDays(trip.days, currency)
    })));
}