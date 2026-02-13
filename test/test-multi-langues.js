import AnalyseurSolidIntelligent from '../src/services/analyseur-cohesion/intelligent/analyseur-solid-intelligent.js';

const analyseur = new AnalyseurSolidIntelligent();

const codeJavaFibleCohesion = `
public class PaymentService {
    private String apiKey;
    private Logger logger;
    private Database db;

    public void processPayment(double amount) {
        // Logique de calcul
        double tax = amount * 0.2;
        this.db.save(amount + tax);
        this.logger.info("Payment processed");
    }

    public void sendInvoice(String email) {
        // Envoi d'email (pas de lien avec apiKey ou db)
        System.out.println("Sending email to " + email);
    }
}
`;

const codePythonFibreCohesion = `
class OrderManager:
    def __init__(self, db, mailer):
        self.db = db
        self.mailer = mailer

    def create_order(self, order):
        self.db.save(order)
        print("Order saved")

    def validate_address(self, address):
        # Ne touche pas à self.db ou self.mailer
        return len(address) > 10

    def send_newsletter(self, users):
        self.mailer.send_bulk(users)
`;

async function tester() {
    console.log('🧪 Test Java: PaymentService (Faible Cohésion Attendue)');
    const resJava = analyseur.analyserFichier('src/services/PaymentService.java', codeJavaFibleCohesion);
    console.log(`Status: ${resJava.status === 'error' ? '✅' : '❌'} (${resJava.status})`);
    console.log(`Cohésion: ${resJava.metriques.cohesion}%`);
    console.log(`Nombre de responsabilités: ${resJava.metriques.responsabilites}`);
    if (resJava.violations.length > 0) {
        resJava.violations.forEach(v => console.log(` - Violation: [${v.principe}] ${v.raison}`));
    }

    console.log('\n🧪 Test Python: OrderManager (Faible Cohésion Attendue)');
    const resPy = analyseur.analyserFichier('src/managers/OrderManager.py', codePythonFibreCohesion);
    console.log(`Status: ${resPy.status === 'error' ? '✅' : '❌'} (${resPy.status})`);
    console.log(`Cohésion: ${resPy.metriques.cohesion}%`);
    console.log(`Nombre de responsabilités: ${resPy.metriques.responsabilites}`);
    if (resPy.violations.length > 0) {
        resPy.violations.forEach(v => console.log(` - Violation: [${v.principe}] ${v.raison}`));
    }
}

tester().catch(err => console.error(err));
