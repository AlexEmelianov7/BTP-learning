const cds = require("@sap/cds");

class ProcessorService extends cds.ApplicationService {
    /** Registering custom event handlers */
    init() {
        this.before("UPDATE", "Incidents", (req) => this.onUpdate(req));
        this.after("READ", "Incidents", () => this.getCustomers());
        this.before("CREATE", "Incidents", (req) => this.changeUrgencyDueToSubject(req.data));

        this.on("getItemsByQuantity", (quantity) => this.getItemsByQuantity(quantity));
        this.on("createItem", (req) => this.createItemHandler(req));
        this.before('createItem', (req) => this.validateItemQuantity(req));

        return super.init();
    }

    changeUrgencyDueToSubject(data) {
        if (data) {
            const incidents = Array.isArray(data) ? data : [data];
            incidents.forEach((incident) => {
                if (incident.title?.toLowerCase().includes("urgent")) {
                    incident.urgency = { code: "H", descr: "High" };
                }
            });
        }
    }

    /** Custom Validation */
    async onUpdate(req) {
        const { status_code } = await SELECT.one(req.subject, i => i.status_code).where({ ID: req.data.ID })
        if (status_code === 'C')
            return req.reject(`Can't modify a closed incident`)
    }

    async getCustomers() {
        const { Customers } = cds.entities;
        const customers = await SELECT.from(Customers);
        return customers
    }

    async getItemsByQuantity(quantity) {
        const { Items } = cds.entities;
        const items = await SELECT.from(Items).where({ quantity });
        return items;
    }

    async createItemHandler(req) {
        const { Items } = cds.entities;
        const { title, descr, quantity } = req.data;
        const item = await INSERT.into(Items).entries({
            title,
            descr,
            quantity
        });

        return item;
    }

    async validateItemQuantity(req) {
        const { quantity } = req.data;
        if (quantity > 100) {
            return req.reject(400, `Quantity exceeds allowed maximum (100)`);
        }
    }
}

module.exports = { ProcessorService }