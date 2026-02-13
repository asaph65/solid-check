import AnalyseurSolidIntelligent from '../src/services/analyseur-cohesion/intelligent/analyseur-solid-intelligent.js';

const analyseur = new AnalyseurSolidIntelligent();

const bonCodeRepo = `
class UserRepository {
    constructor(db) {
        this.db = db;
        this.table = 'users';
    }
    async findById(id) { return this.db.get(this.table, id); }
    async findAll() { return this.db.all(this.table); }
    async save(user) { return this.db.insert(this.table, user); }
    async update(id, user) { return this.db.update(this.table, id, user); }
    async delete(id) { return this.db.delete(this.table, id); }
}
`;

const mauvaisCodeService = `
class UserService {
    constructor(db, mailer, logger) {
        this.db = db;
        this.mailer = mailer;
        this.logger = logger;
    }
    async register(user) {
        await this.db.save(user); // CRUD
        if (user.isValid()) { // VALIDATION
            await this.mailer.sendWelcome(user); // NOTIFICATION
            this.logger.log('User registered');
        }
    }
    calculateTax(amount) { return amount * 0.2; } // CALCUL
}
`;

async function tester() {
    console.log('🧪 Test 1: Repository Cohésif (Attendu : SUCCESS)');
    const res1 = analyseur.analyserFichier('src/repositories/UserRepository.js', bonCodeRepo);
    console.log(`Status: ${res1.status === 'success' ? '✅' : '❌'} (${res1.status})`);
    console.log(`Cohésion: ${res1.metriques.cohesion}%`);

    console.log('\n🧪 Test 2: Service Multi-Responsabilités (Attendu : ERROR)');
    const res2 = analyseur.analyserFichier('src/services/UserService.js', mauvaisCodeService);
    console.log(`Status: ${res2.status === 'error' ? '✅' : '❌'} (${res2.status})`);
    console.log(`Nombre de responsabilités: ${res2.metriques.responsabilites}`);
    if (res2.violations.length > 0) {
        console.log(`Violation: ${res2.violations[0].raison}`);
    }
}

tester().catch(err => console.error(err));
