const driverschema= require("../Models/Profiledata")
const returnload=require("../Models/returnLoad")
const AvailableLoad=require("../Models/Availableload")
const Booking=require("../Models/booking")


const driverprofile = async (req, res) => {
  try {
    const { Phone, Capacity, TruckNumber, Home, Route, Name, Email } = req.body;

    console.log("Received profile:", req.body);

    // Save to DB (example)
    const saved = await driverschema.create({
      Phone,
      Capacity,
      TruckNumber,
      Home,
      Route,
      Name,
      Email
    });

    res.send({ isProfileSaved: 1, data: saved });
  } catch (error) {
    console.error(error);
    res.status(500).send({ isProfileSaved: 0, error: "Server error" });
  }
};

const findprofile = async (req, res) => {
  let isexist = 0;  // Move outside try so catch can access it

  try {
    const { Email } = req.body;

    const user = await driverschema.findOne({ Email });

    if (user) {
      isexist = 1;
    }

    res.send({ isexist });
  } catch (error) {
    console.error(error);
    res.send({
      isexist: isexist
    });
  }
};

const loadreturn = async (req, res) => {
  try {
    const { 
      Email, 
      driverfinallocation, 
      driverdemand, 
      drivercurrentlocatio, 
      loaddate 
    } = req.body;

    // Save real load (but not returning)
    await returnload.create({
      Email,
      driverfinallocation,
      driverdemand,
      drivercurrentlocatio,
      loaddate
    });

    

  

    // Send only fake data one-by-one
    return res.send({
      isloadSaved: 1,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      isloadSaved: 0,
    });
  }
};

const availableload = async (req, res) => {
  try {
    const { driverfinallocation, drivercurrentlocatio, Capacity } = req.body;


    // Convert inputs to lowercase
    const driverFinal = driverfinallocation.toLowerCase().trim();
    const driverCurrent = drivercurrentlocatio.toLowerCase().trim();
    const driverCapacity = Number(Capacity);

    // Fetch all loads
    const loads = await AvailableLoad.find({});

    // Filter loads based on location & capacity
    const matchedLoads = loads.filter(load => {
      const loadFrom = load.from.toLowerCase().trim();
      const loadTo = load.to.toLowerCase().trim();
      const loadWeight = parseInt(load.weight); // Convert "18 tons" or "12000kg"

      const locationMatch =
        driverCurrent === loadFrom || driverFinal === loadTo;

      const capacityMatch = driverCapacity >= loadWeight;

      return locationMatch && capacityMatch;
    });

    if (matchedLoads.length === 0) {
      return res.send({
        success: 0,
        message: "No matching loads found",
        total: matchedLoads.length,
        loads: []
      });
    }

    return res.send({
      success: 1,
      message: "Matching loads found",
      total: matchedLoads.length,
      loads: matchedLoads,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).send({
      
      error: "Server error"
    });
  }
};

const availableBooking = async (req, res) => {
  try {
    const { Email } = req.body;

    // Find bookings for the given email
    const bookings = await Booking.find({ Email });
    console.log(bookings);

    if (bookings.length > 0) {
      // User has bookings
      return res.send({
        isBookingAvailable: 1,
      });
    } else {
      // No bookings found
      return res.send({
        isBookingAvailable: 0,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};


const BackendRun = async (req, res) => {
  try {
    // Simple response to indicate backend is running
    return res.status(200).json({
      status: 'ok',
      message: 'Backend is awake and running!'
    });
  } catch (error) {
    console.error('Error in BackendRun:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong on the backend'
    });
  }
};





module.exports={driverprofile,findprofile,loadreturn,availableload,availableBooking,BackendRun}  
