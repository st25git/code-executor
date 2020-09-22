import { Worker } from '../src/codeExecutor';

const worker = new Worker('myexecutor', 'redis://127.0.0.1:6379');

async function main() {
    await worker.build();
    worker.start();
}

main();