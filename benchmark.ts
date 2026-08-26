const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function sequential(monitors) {
    for (const m of monitors) {
        await delay(5); // Simulate db update/encrypt
    }
}

async function parallel(monitors) {
    await Promise.all(monitors.map(async m => {
        await delay(5);
    }));
}

async function run() {
    const monitors = Array.from({ length: 100 }, (_, i) => i);

    let start = performance.now();
    await sequential(monitors);
    let end = performance.now();
    console.log(`Sequential: ${end - start}ms`);

    start = performance.now();
    await parallel(monitors);
    end = performance.now();
    console.log(`Parallel: ${end - start}ms`);
}

run();
