import Docker from 'dockerode';
import Bull from 'bull';
import Runner from './Runner';
import Builder from './Builder';

const docker = new Docker();
const runner = new Runner(docker);
const builder = new Builder(docker);

interface TestCase {
    input: string;
    output: string;
}
interface Code {
    id: string;
    code: string,
    language: string,
    testCases: TestCase[];
}

export default class Worker {
    private redis: string;

    private name: string;

    constructor(name: string, redis: string) {
        this.redis = redis;
        this.name = name;
    }

    private queue = (() => new Bull(this.name, this.redis))();

    private static async work(codeOptions: Code): Promise<void> {
        const tag = `${codeOptions.language.toLowerCase()}-runner`;
        const { code } = codeOptions;
        await runner.run({ tag, code, testCases: codeOptions.testCases });
    }

    static async build() {
        await builder.build();
    }

    start() {
        this.queue.process(async (job, done) => {
            await Worker.work(job.data);
            done();
        });
    }
}