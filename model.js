class Group {
    constructor(id, title, createdAt, tasks) {
        this.id = id || null;
        this.title = title || '';
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
        this.tasks = tasks || [];
    }
}

class Task {
    constructor(id, title, createdAt, records, group) {
        this.id = id || null;
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
        this.title = title || '';
        this.records = records || [];
        this.group = group || null;
    }
}

class Record {
    constructor(task, start, end, disabled) {
        this.task = task;
        this.start = new Date(start);
        this.end = new Date(end);
        this.disabled = !!disabled;
    }
    
    getStartStr() {
        return moment(this.start).format('lll');
    }
    
    getEndStr() {
        return moment(this.end).format('lll');
    }
    
    getDurationStr() {
        const duration = Math.round((this.end.getTime() - this.start.getTime()) / 1000);
        let hours   = Math.floor(duration / 3600);
        let minutes = Math.floor((duration - (hours * 3600)) / 60);
        let seconds = duration - (hours * 3600) - (minutes * 60);
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        return hours + ':' + minutes + ':' + seconds;
    }
    
    getDurationHours() {
        return (this.end.getTime() - this.start.getTime()) / 1000 / 60 / 60;
    }
}
