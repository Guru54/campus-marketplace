const mongoose = require("mongoose");
const dotenv   = require("dotenv");
const College  = require("../models/College");

dotenv.config();

const colleges = [

  // ── Pune ──────────────────────────────────────────────────
  {
    name:   "Pimpri Chinchwad College of Engineering",
    domain: "pccoepune.org",
    city:   "Pune",
    state:  "Maharashtra",
  },
  {
    name:   "College of Engineering Pune",
    domain: "coep.org.in",
    city:   "Pune",
    state:  "Maharashtra",
  },
  {
    name:   "Vishwakarma Institute of Technology",
    domain: "vit.edu",
    city:   "Pune",
    state:  "Maharashtra",
  },
  {
    name:   "MIT College of Engineering",
    domain: "mitcoe.edu.in",
    city:   "Pune",
    state:  "Maharashtra",
  },
  {
    name:   "Symbiosis Institute of Technology",
    domain: "sitpune.edu.in",
    city:   "Pune",
    state:  "Maharashtra",
  },
  {
    name:   "Pune Institute of Computer Technology",
    domain: "pict.edu",
    city:   "Pune",
    state:  "Maharashtra",
  },
  {
    name:   "Bharati Vidyapeeth College of Engineering",
    domain: "bvcoepune.edu.in",
    city:   "Pune",
    state:  "Maharashtra",
  },
  {
    name:   "Indira College of Engineering and Management",
    domain: "icem.org.in",
    city:   "Pune",
    state:  "Maharashtra",
  },

  // ── Mumbai ────────────────────────────────────────────────
  {
    name:   "Institute of Chemical Technology",
    domain: "ictmumbai.edu.in",
    city:   "Mumbai",
    state:  "Maharashtra",
  },
  {
    name:   "Veermata Jijabai Technological Institute",
    domain: "vjti.ac.in",
    city:   "Mumbai",
    state:  "Maharashtra",
  },
  {
    name:   "Sardar Patel Institute of Technology",
    domain: "spit.ac.in",
    city:   "Mumbai",
    state:  "Maharashtra",
  },
  {
    name:   "K.J. Somaiya College of Engineering",
    domain: "somaiya.edu",
    city:   "Mumbai",
    state:  "Maharashtra",
  },
  {
    name:   "Thadomal Shahani Engineering College",
    domain: "tsec.edu",
    city:   "Mumbai",
    state:  "Maharashtra",
  },
  {
    name:   "Dwarkadas J. Sanghvi College of Engineering",
    domain: "djsce.ac.in",
    city:   "Mumbai",
    state:  "Maharashtra",
  },

  // ── Nagpur ────────────────────────────────────────────────
  {
    name:   "Visvesvaraya National Institute of Technology Nagpur",
    domain: "vnit.ac.in",
    city:   "Nagpur",
    state:  "Maharashtra",
  },
  {
    name:   "Yeshwantrao Chavan College of Engineering",
    domain: "ycce.edu",
    city:   "Nagpur",
    state:  "Maharashtra",
  },

  // ── Nashik ────────────────────────────────────────────────
  {
    name:   "Sandip Institute of Technology and Research Centre",
    domain: "sandipfoundation.org",
    city:   "Nashik",
    state:  "Maharashtra",
  },
  {
    name:   "K.K. Wagh Institute of Engineering Education and Research",
    domain: "kkwagh.edu.in",
    city:   "Nashik",
    state:  "Maharashtra",
  },

  // ── Aurangabad ────────────────────────────────────────────
  {
    name:   "Government College of Engineering Aurangabad",
    domain: "geca.ac.in",
    city:   "Aurangabad",
    state:  "Maharashtra",
  },
  {
    name:   "MGM College of Engineering",
    domain: "mgmcen.ac.in",
    city:   "Aurangabad",
    state:  "Maharashtra",
  },

  // ── Kolhapur ──────────────────────────────────────────────
  {
    name:   "Shivaji University College of Engineering",
    domain: "unishivaji.ac.in",
    city:   "Kolhapur",
    state:  "Maharashtra",
  },
  {
    name:   "DY Patil College of Engineering Kolhapur",
    domain: "dypvp.edu.in",
    city:   "Kolhapur",
    state:  "Maharashtra",
  },

  // ── Bangalore ─────────────────────────────────────────────
  {
    name:   "Indian Institute of Science",
    domain: "iisc.ac.in",
    city:   "Bangalore",
    state:  "Karnataka",
  },
  {
    name:   "RV College of Engineering",
    domain: "rvce.edu.in",
    city:   "Bangalore",
    state:  "Karnataka",
  },
  {
    name:   "PES University",
    domain: "pes.edu",
    city:   "Bangalore",
    state:  "Karnataka",
  },
  {
    name:   "BMS College of Engineering",
    domain: "bmsce.ac.in",
    city:   "Bangalore",
    state:  "Karnataka",
  },
  {
    name:   "MS Ramaiah Institute of Technology",
    domain: "msrit.edu",
    city:   "Bangalore",
    state:  "Karnataka",
  },

  // ── Chennai ───────────────────────────────────────────────
  {
    name:   "Anna University",
    domain: "annauniv.edu",
    city:   "Chennai",
    state:  "Tamil Nadu",
  },
  {
    name:   "SSN College of Engineering",
    domain: "ssn.edu.in",
    city:   "Chennai",
    state:  "Tamil Nadu",
  },
  {
    name:   "SRM Institute of Science and Technology",
    domain: "srmist.edu.in",
    city:   "Chennai",
    state:  "Tamil Nadu",
  },

  // ── Hyderabad ─────────────────────────────────────────────
  {
    name:   "BITS Pilani Hyderabad Campus",
    domain: "hyderabad.bits-pilani.ac.in",
    city:   "Hyderabad",
    state:  "Telangana",
  },
  {
    name:   "Chaitanya Bharathi Institute of Technology",
    domain: "cbit.ac.in",
    city:   "Hyderabad",
    state:  "Telangana",
  },
  {
    name:   "Osmania University College of Engineering",
    domain: "osmania.ac.in",
    city:   "Hyderabad",
    state:  "Telangana",
  },

  // ── Delhi / NCR ───────────────────────────────────────────
  {
    name:   "Delhi Technological University",
    domain: "dtu.ac.in",
    city:   "Delhi",
    state:  "Delhi",
  },
  {
    name:   "Netaji Subhas University of Technology",
    domain: "nsut.ac.in",
    city:   "Delhi",
    state:  "Delhi",
  },
  {
    name:   "Indraprastha Institute of Information Technology",
    domain: "iiitd.ac.in",
    city:   "Delhi",
    state:  "Delhi",
  },
  {
    name:   "Jamia Millia Islamia",
    domain: "jmi.ac.in",
    city:   "Delhi",
    state:  "Delhi",
  },

  // ── IITs ──────────────────────────────────────────────────
  {
    name:   "Indian Institute of Technology Bombay",
    domain: "iitb.ac.in",
    city:   "Mumbai",
    state:  "Maharashtra",
  },
  {
    name:   "Indian Institute of Technology Delhi",
    domain: "iitd.ac.in",
    city:   "Delhi",
    state:  "Delhi",
  },
  {
    name:   "Indian Institute of Technology Madras",
    domain: "iitm.ac.in",
    city:   "Chennai",
    state:  "Tamil Nadu",
  },
  {
    name:   "Indian Institute of Technology Kharagpur",
    domain: "iitkgp.ac.in",
    city:   "Kharagpur",
    state:  "West Bengal",
  },
  {
    name:   "Indian Institute of Technology Kanpur",
    domain: "iitk.ac.in",
    city:   "Kanpur",
    state:  "Uttar Pradesh",
  },
  {
    name:   "Indian Institute of Technology Roorkee",
    domain: "iitr.ac.in",
    city:   "Roorkee",
    state:  "Uttarakhand",
  },
  {
    name:   "Indian Institute of Technology Hyderabad",
    domain: "iith.ac.in",
    city:   "Hyderabad",
    state:  "Telangana",
  },
  {
    name:   "Indian Institute of Technology Pune",
    domain: "iitpune.ac.in",
    city:   "Pune",
    state:  "Maharashtra",
  },

  // ── NITs ──────────────────────────────────────────────────
  {
    name:   "National Institute of Technology Trichy",
    domain: "nitt.edu",
    city:   "Tiruchirappalli",
    state:  "Tamil Nadu",
  },
  {
    name:   "National Institute of Technology Surathkal",
    domain: "nitk.edu.in",
    city:   "Surathkal",
    state:  "Karnataka",
  },
  {
    name:   "National Institute of Technology Warangal",
    domain: "nitw.ac.in",
    city:   "Warangal",
    state:  "Telangana",
  },
  {
    name:   "National Institute of Technology Calicut",
    domain: "nitc.ac.in",
    city:   "Calicut",
    state:  "Kerala",
  },
  {
    name: "Baderia Global institute of Engineering and Technology Jabalpur",
    domai: "global.org.in",
    city: "jabalpur",
    state: "Madhya Pradesh"
  }
];

const seedColleges = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const logger = require('../utils/logger');
    logger.log("DB connected");

    let added   = 0;
    let updated = 0;
   
    for (const college of colleges) {
      const result = await College.updateOne(
        { domain: college.domain },
        { $set: college },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        logger.log(`Added:   ${college.name}`);
        added++;
      } else {
        logger.log(`Updated: ${college.name}`);
        updated++;
      }
    }

    logger.log("\n─────────────────────────────────");
    logger.log(`Seeding complete!`);
    logger.log(`Added:   ${added} colleges`);
    logger.log(` Updated: ${updated} colleges`);
    logger.log(`Total:   ${colleges.length} colleges`);
    logger.log("─────────────────────────────────");
    process.exit(0);

  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedColleges();