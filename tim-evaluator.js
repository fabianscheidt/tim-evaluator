class TimEvaluator {
    
    constructor() {
        this.groups = [];
        this.tasks = [];
        this.records = [];
        this.fileInput = null;
        this.gapDestination = null;
        this.recordsTable = null;
        this.barChart = null;
        
        this.tabs = [];
        this.visibleTab = 0;
        
        this.minGapDuration = 5 * 60 * 1000;
    }
    
    /**
     * Attaches event handlers to initialize the app
     */
    init() {
        // Get DOM references
        this.fileInput = document.querySelector('#file-input');
        this.gapDestination = document.querySelector('#gap-destination');
        this.recordsTable = document.querySelector('#records-table');
        this.barChart = echarts.init(document.querySelector('#bar-chart'), 'tim-evaluator');
        this.tabs = [
            document.querySelector('.evaluation'),
            document.querySelector('.records-list')
        ];
        
        // Attach event listeners
        this.fileInput.addEventListener('change', () => this.handleFileChange());
        document.querySelector('#show-evaluation-button').addEventListener('click', () => this.showTab(0));
        document.querySelector('#show-records-button').addEventListener('click', () => this.showTab(1));
        document.querySelector('#export-button').addEventListener('click', () => this.export());
        
        // Initilize the view
        this.updateView();
    }
    
    /**
     * Reads a Tim export file and updates the view
     */
    handleFileChange() {
        // Empty tasks and records and update the view
        this.groups = [];
        this.tasks = [];
        this.records = [];
        this.updateView();
        
        // Check if files are present. Abort if not.
        const files = this.fileInput.files;
        if (!files || !files.length) {
            return;
        }
        
        // Now read the first selected file
        const fileReader = new FileReader();
        fileReader.onload = () => {
            const result = JSON.parse(fileReader.result);
            
            // Read groups from the file and map them to objects
            for (const groupId of Object.keys(result.groups)) {
                const groupSrc = result.groups[groupId];
                const group = new Group(groupId, groupSrc.title, groupSrc.createdAt);
                this.groups.push(group);
            }
            
            // Read the tasks and records from the file and map them to objects
            for (const taskId of Object.keys(result.tasks)) {
                const taskSrc = result.tasks[taskId];
                const task = new Task(taskId, taskSrc.title, taskSrc.createdAt);
                
                task.records = taskSrc.records.map((record) => new Record(task, record.start, record.end));
                this.tasks.push(task);
                this.records = this.records.concat(task.records);
                
                const groupId = result.nodes.find((node) => node.id === taskId).parent;
                if (groupId) {
                    const group = this.groups.find((group) => group.id === groupId);
                    task.group = group;
                    group.tasks.push(task);
                }
            }
            
            // Sort records by start date
            this.records.sort((a, b) => a.start.getTime() - b.start.getTime());
            
            // Find gaps and add them as disabled records
            const gaps = [];
            let lastRecord = null;
            for(const record of this.records) {
                if (lastRecord && lastRecord.end.getTime() + this.minGapDuration < record.start.getTime()) {
                    gaps.push(new Record(null, lastRecord.end, record.start, true));
                }
                lastRecord = record;
            }
            this.records = this.records.concat(gaps);
            
            // Sort by date once more
            this.records.sort((a, b) => a.start.getTime() - b.start.getTime());
            
            // Update the view
            this.updateView();
        }
        fileReader.readAsText(files[0]);
    }
    
    /**
     * Enables the tab with the provided index
     *
     * @param index
     */
    showTab(index) {
        this.visibleTab = index;
        this.updateView();
    }
    
    /**
     * Toggles the disabled property of a record
     *
     * @param record
     */
    toggleDisabled(record) {
        record.disabled = !record.disabled;
        this.updateView();
    }
    
    /**
     * Downloads a file that can be imported to Tim
     */
    export() {
        // Find enabled gaps
        const gaps = this.records.filter((record) => !record.task && !record.disabled);
        
        // Find selected task
        const taskId = this.gapDestination.value;
        const task = this.tasks.find((task) => task.id === taskId);
        
        // Assign the task to the gaps
        gaps.forEach((gap) => gap.task = task);
        task.records = task.records.concat(gaps);
        
        // Now generate the resulting structure
        const res = {
            tasks: {},
            groups: {},
            nodes: []
        };
        
        for (const group of this.groups) {
            res.groups[group.id] = {
                id: group.id,
                title: group.title,
                updatedAt: (new Date()).getTime(),
                createdAt: group.createdAt.getTime()
            };
            res.nodes.push({ id: group.id });
        }
        
        for (const task of this.tasks) {
            res.tasks[task.id] = {
                records: task.records.filter((record) => !record.disabled).map((record) => ({
                    start: record.start.getTime(),
                    end: record.end.getTime()
                })),
                id: task.id,
                title: task.title,
                updatedAt: (new Date()).getTime(),
                createdAt: task.createdAt.getTime()
            }
            const node = { id: task.id };
            if (task.group) {
                node.parent = task.group.id;
            }
            res.nodes.push(node);
        }
        
        const resJson = JSON.stringify(res, null, 2);
        this.downloadString(resJson, 'text/json', 'export.json');
        
        this.updateView();
    }
    
    /**
     * Starts a file download of a text string
     *
     * @param text
     * @param fileType
     * @param fileName
     */
    downloadString(text, fileType, fileName) {
        const blob = new Blob([text], { type: fileType });
        
        const a = document.createElement('a');
        a.download = fileName;
        a.href = URL.createObjectURL(blob);
        a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500);
    }
    
    
    /**
     * Updates the view
     */
    updateView() {
        this.updateChart();
        this.updateRecordsList();
        this.updateExportList();
        
        // Update the visible tab
        this.tabs.forEach((tab) => tab.style.display = 'none');
        this.tabs[this.visibleTab].style.display = 'block';
    }
    
    /**
     * Updates the chart options based on the current tasks
     */
    updateChart() {
        // Initialize empty chart options
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            legend: {
                data: []
            },
            xAxis: {
                type: 'value'
            },
            yAxis: {
                type: 'category',
                data: [],
                inverse: true
            },
            series: []
        };
        
        // Initialize legend and series for each tas
        option.legend.data = this.tasks.map((task) => task.title);
        option.series = this.tasks.map((task) => ({
            name: task.title,
            type: 'bar',
            stack: 'single',
            data: []
        }));
        
        // Populate for each week
        let lastWeek = '';
        for (const record of this.records) {
            if (record.disabled || !record.task) {
                continue;
            }
            
            const recordWeek = 'KW ' + moment(record.start).format('YYYY-WW');
            if (recordWeek !== lastWeek) {
                option.yAxis.data.push(recordWeek);
                option.series.forEach((series) => series.data.push(0));
                lastWeek = recordWeek;
            }
            
            const taskIndex = this.tasks.indexOf(record.task);
            const series = option.series[taskIndex];
            series.data[series.data.length - 1] += record.getDurationHours();
        }
        
        // Now update the chart itself
        this.barChart.setOption(option);
    }
    
    /**
     * Updates the list of time records
     */
    updateRecordsList() {
        const tableBody = this.recordsTable.querySelector('tbody');
        tableBody.innerHTML = '';
        this.records.forEach((record) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
            <td>${ record.getStartStr() }</td>
            <td>${ record.getEndStr() }</td>
            <td>${ record.getDurationStr() }</td>
            <td>${ record.task ? record.task.title : '-' }</td>
            <td><input type="checkbox" ${ record.disabled ? '' : 'checked' }></td>`;
            tr.classList = record.disabled ? ['disabled'] : [];
            tr.querySelector('td input').addEventListener('click', () => this.toggleDisabled(record));
            tableBody.appendChild(tr);
        });
    }
    
    /**
     * Updates the selection in the export section
     */
    updateExportList() {
        this.gapDestination.innerHTML = '';
        for (const task of this.tasks) {
            const option = document.createElement('option');
            option.value = task.id;
            option.innerText = task.title;
            this.gapDestination.appendChild(option);
        }
    }
}
