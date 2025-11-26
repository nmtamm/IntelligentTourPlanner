export async function convertCurrency(amount: number, source: string, target: string) {
    const res = await fetch(
        `http://localhost:8000/api/exchangerate?amount=${amount}&source=${source}&target=${target}`
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.amount;
}