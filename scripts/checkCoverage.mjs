import fs from 'fs/promises';

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node checkCoverage.mjs <lcov-file>');
    process.exit(1);
  }
  const content = await fs.readFile(file, 'utf8');
  let linesFound = 0;
  let linesHit = 0;
  let branchesFound = 0;
  let branchesHit = 0;
  for (const line of content.split(/\n/)) {
    if (line.startsWith('LF:')) linesFound += Number(line.slice(3));
    else if (line.startsWith('LH:')) linesHit += Number(line.slice(3));
    else if (line.startsWith('BRF:')) branchesFound += Number(line.slice(4));
    else if (line.startsWith('BRH:')) branchesHit += Number(line.slice(4));
  }
  const lineRate = linesFound ? (linesHit / linesFound) * 100 : 100;
  const branchRate = branchesFound ? (branchesHit / branchesFound) * 100 : 100;
  const min = 90;
  if (lineRate < min || branchRate < min) {
    console.error(`Coverage below ${min}% - lines: ${lineRate.toFixed(2)}%, branches: ${branchRate.toFixed(2)}%`);
    process.exit(1);
  } else {
    console.log(`Coverage OK - lines: ${lineRate.toFixed(2)}%, branches: ${branchRate.toFixed(2)}%`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
