const cds = require('@sap/cds')

class RemoteService extends cds.ApplicationService {
    /** Registering custom event handlers */
    async init() {
        this.on("getExternalOrders", () => this.getOrders());
        this.on("getExternalOrdersDest", (req) => this.getOrdersDest(req));

        this.northwind = await cds.connect.to("northwind");
        this.northwindDest = await cds.connect.to("northwind");

        return super.init();
    }

    async getOrders() {
        const { Orders } = this.northwind.entities;
        const result = await this.northwind.run(SELECT.from(Orders));
        return result;
    }

    async getOrdersDest(req) {
        const { Orders } = this.northwindDest.entities;
        const top = req.data?.Top || 10;

        const result = await this.northwindDest.run(
            SELECT.from(Orders).limit(top)
        );

        return result;
    }
}
module.exports = { RemoteService }