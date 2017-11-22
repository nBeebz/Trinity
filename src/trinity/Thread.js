/**
 * Simple class for creating Web Worker threads from arbitrary code.
 * 
 * @class Thread
 */
class Thread{
    /**
     * Creates an instance of Thread.
     * @param {Object} worker The code that is to be run asynchronously.
     * @param {any} callback The function to be called for this workers onmessage() event.
     * @memberof Thread
     */
    constructor(worker, callback){
        if(!window.Worker){
            throw 'Web Workers Unsupported in this browser';
        }else{
            var code = worker.toString();
            code = code.substring(code.indexOf("{")+1, code.lastIndexOf("}"));
            var blob = new Blob([code], {type: "application/javascript"});
            this.worker = new Worker(URL.createObjectURL(blob));
            this.worker.onmessage(callback);
        }
    }
}