const cds = require("@sap/cds");

class ProcessorService extends cds.ApplicationService {
    /** Registering custom event handlers */
    init() {
        this.before("UPDATE", "Incidents", (req) => this.onUpdate(req));
        this.after("READ", "Incidents", () => this.getCustomers());
        this.before("CREATE", "Incidents", (req) => this.changeUrgencyDueToSubject(req.data));
        this.on("getItemsByQuantity", (quantity) => this.getItemsByQuantity(quantity));
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
    async onUpdate (req) {
        const { status_code } = await SELECT.one(req.subject, i => i.status_code).where({ID: req.data.ID})
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
}

module.exports = { ProcessorService }