const input1 = process.env.INPUT1;
const input2 = process.env.INPUT2;

async function runTask() {
    while (true) {
        console.log(`Running task with inputs: ${input1}, ${input2}`);
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
}

runTask().catch(console.error);

