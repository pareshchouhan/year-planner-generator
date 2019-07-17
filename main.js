
function populateYearSelector() {
	const currentYear = new Date().getFullYear();
	let years = new Array(20).fill(0);
	years = years.map((value, index) => {
		return `${currentYear + index}`;
	});
	const yearSelector = $('#year-selector');
	years.forEach(year => {
		let optionString = `<option value=${year}>${year}</option>`;
		if (currentYear === year) {
			optionString = `<option value=${year} selected>${year}</option>`;
		}
		yearSelector.append(
			optionString
		);
	});

}
populateYearSelector();

$(document).ready(function() {
	$('#generate-year-plan').click(function() {
		createWorkbookForYear($('#year-selector').val() || new Date().getFullYear());
	});
	// Init Webworker.
	initWebWorker();
	createWorkbookForYear($('#year-selector').val() || new Date().getFullYear());
});

function initWebWorker() {
	if (window.Worker) {
		window.ypgrCoreWorker = new Worker('ypgrcore.webworker.js');
		window.ypgrCoreWorker.onmessage = YPGrWorkerMessageHandler;
	}
}

/* recieves data from webworker */
function YPGrWorkerMessageHandler(event) {

}
/* Uses a webworker if window.Worker exists other wise does calculation on main thread. */
function createWorkbookForYear(year) {
	const workbook = XLSX.utils.book_new();

	// XLSX.utils.aoa_to_sheet
	// delete to WebWorker so main thread is free.
	if (!window.ypgrCoreWorker) {
		window.ypgrCoreWorker.postMessage({

		});
	} else {
		// if no window worker, use ypgrcore functions directly. 
		const ypgrCore = new YGPrCore();
		const yearData = ypgrCore.generateYearPlannerForYear(year);
		let daysTop = [];
		for (let i = 0 ; i < 6; i++) {
			daysTop = daysTop.concat(YGPrCore.dayMap);
		}
		daysTop = daysTop.slice(0, 36);
		console.log(daysTop.length);
		let emptyBlocksAtStart = yearData[0][0];
		let emptyBlocksAtEnd = yearData[0][yearData[0].length - 1];
		console.log(yearData[0][0]);
		const yearSheetData = [
			[].concat([' '], daysTop),
			[].concat(['January'], generateConcatArray(yearData, 0)),
			[].concat(['February'], generateConcatArray(yearData, 1)),
			[].concat(['March'], generateConcatArray(yearData, 2)),
			[].concat(['April'], generateConcatArray(yearData, 3)),
			[].concat(['May'], generateConcatArray(yearData, 4)),
			[].concat(['June'], generateConcatArray(yearData, 5)),
			[].concat(['July'], generateConcatArray(yearData, 6)),
			[].concat(['August'], generateConcatArray(yearData, 7)),
			[].concat(['September'], generateConcatArray(yearData, 8)),
			[].concat(['October'], generateConcatArray(yearData, 9)),
			[].concat(['November'], generateConcatArray(yearData, 10)),
			[].concat(['December'], generateConcatArray(yearData, 11))
		];
		console.log(yearSheetData);
		console.log(yearData[11]);
		const worksheet = XLSX.utils.aoa_to_sheet(yearSheetData);
		XLSX.utils.book_append_sheet(workbook, worksheet,'Planner');
		$('#generated-year-data').html(
			`
				<pre>
					    ${daysTop.join('')}
					Jan  ${generateConcatArray(yearData, 0).join('         ')}
					Feb  ${generateConcatArray(yearData, 1).join('         ')}
					Mar  ${generateConcatArray(yearData, 2).join('         ')}
					Apr  ${generateConcatArray(yearData, 3).join('         ')}
					May  ${generateConcatArray(yearData, 4).join('         ')}
					Jun  ${generateConcatArray(yearData, 5).join('         ')}
					Jul  ${generateConcatArray(yearData, 6).join('         ')}
					Aug  ${generateConcatArray(yearData, 7).join('         ')}
					Sep  ${generateConcatArray(yearData, 8).join('         ')}
					Oct  ${generateConcatArray(yearData, 9).join('         ')}
					Nov  ${generateConcatArray(yearData, 10).join('         ')}
					Dec  ${generateConcatArray(yearData, 11).join('         ')}
				</pre>
			`
		)
	}
	// Download file once we are done with creating the year planner.
	// XLSX.writeFile(workbook, `YPGr-${year}.xlsb`);
}

function generateConcatArray(yearData, monthIndex) {
	let daysToFillAtEnd = 6 - yearData[monthIndex][yearData[monthIndex].length - 1] + 1;
	if (daysToFillAtEnd === 7) {
		daysToFillAtEnd = 0;
	}
	return [].concat(new Array(yearData[monthIndex][0]).fill('X'), yearData[monthIndex].map(value => '='), new Array(daysToFillAtEnd).fill('X'));
}