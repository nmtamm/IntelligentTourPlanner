export function parseAmount(amount: string | number) {
    if (typeof amount === "number") {
        return { min: amount, max: amount, isApprox: false };
    }
    if (!amount) return { min: 0, max: 0, isApprox: false };
    const cleaned = amount.replace(/[^\d\-–—\.]/g, '').trim();
    const dashRegex = /[-–—]/;
    if (dashRegex.test(cleaned)) {
        const [a, b] = cleaned.split(dashRegex).map(s => parseFloat(s));
        if (!isNaN(a) && !isNaN(b)) return { min: a, max: b, isApprox: true };
        if (!isNaN(a)) return { min: a, max: a, isApprox: true };
        if (!isNaN(b)) return { min: b, max: b, isApprox: true };
        return { min: 0, max: 0, isApprox: false };
    }
    const num = parseFloat(cleaned);
    return isNaN(num) ? { min: 0, max: 0, isApprox: false } : { min: num, max: num, isApprox: false };
}

export function detectCurrencyAndNormalizePrice(price: any, defaultCurrency: "USD" | "VND") {
    let detectedCurrency: "USD" | "VND" = defaultCurrency;
    let symbol = "";
    let normalizedPrice = price;

    if (typeof price === "string") {
        symbol = price.trim().charAt(0);
        if (symbol === "₫") {
            detectedCurrency = "VND";
        } else if (symbol === "$") {
            detectedCurrency = "USD";
        }
        normalizedPrice = price.replace(/^[^\d\-]+/, '').trim();
    }

    return { detectedCurrency, normalizedPrice };
}