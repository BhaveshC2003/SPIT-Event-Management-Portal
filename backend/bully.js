class Bully{
    constructor(pid,priority){
        this.pid = pid
        this.priority = priority
        this.isLeader = false
        this.isActive = true
        this.leader = null
        this.processes = []
    }
    getPid(){
        return this.pid
    }
    getPriority(){
        return this.priority
    }
    setPriority(priority){
        this.priority = priority
    }
    getLeader(){
        return this.leader
    }
    setLeader(leader){
        this.leader = leader
    }
    getStatus(){
        return this.isActive
    }
    setStatus(status){
        this.isActive = status 
    }
    

}