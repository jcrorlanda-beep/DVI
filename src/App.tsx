import { useState, useEffect } from "react";

/* -------------------------------------------------------
   TYPES
------------------------------------------------------- */

type Role = "SERVICE_ADVISOR" | "TECHNICIAN" | "MANAGER";

type PageKey =
  | "SHOP_FLOOR"
  | "INTAKE"
  | "WALKAROUND"
  | "INSPECTION"
  | "RO"
  | "QC"
  | "RELEASE";

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Vehicle {
  id: string;
  customerId: string;
  plate: string;
  vin: string;
  make: string;
  model: string;
  year: number;
}

interface Intake {
  id: string;
  customerId: string;
  vehicleId: string;
  plate: string;
  concern: string;
  walkaround: {
    frontPhoto?: string;
    leftPhoto?: string;
    rearPhoto?: string;
    rightPhoto?: string;
    lfDepth?: number;
    rfDepth?: number;
    lrDepth?: number;
    rrDepth?: number;
    odometer?: number;
    damageNotes?: string;
  };
}

interface AppData {
  customers: Customer[];
  vehicles: Vehicle[];
  intakes: Intake[];
}

interface AppState {
  currentPage: PageKey;
  currentRole: Role;
  currentIntakeId?: string;
}

/* -------------------------------------------------------
   LOCAL STORAGE ENGINE
------------------------------------------------------- */

const STORAGE_KEY = "dvi-workshop-data-v2";

function loadData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { customers: [], vehicles: [], intakes: [] };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return { customers: [], vehicles: [], intakes: [] };
  }
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* -------------------------------------------------------
   ID GENERATOR
------------------------------------------------------- */

function id(prefix: string) {
  return prefix + "-" + Math.random().toString(36).slice(2, 10);
}

/* -------------------------------------------------------
   UI SHELL — SIDEBAR + TOPBAR
------------------------------------------------------- */

function Sidebar({ state, setState }: { state: AppState; setState: any }) {
  const nav = (page: PageKey) =>
    setState((prev: AppState) => ({ ...prev, currentPage: page }));

  return (
    <div
      style={{
        width: "240px",
        background: "#0f172a",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #1e293b",
      }}
    >
      <div style={{ padding: "1rem", fontWeight: 700, fontSize: "1.2rem" }}>
        DVI Workshop OS
      </div>

      {[
        ["SHOP_FLOOR", "Shop Floor"],
        ["INTAKE", "Intake"],
        ["INSPECTION", "Inspection"],
        ["RO", "Repair Orders"],
        ["QC", "Quality Control"],
        ["RELEASE", "Release"],
      ].map(([key, label]) => (
        <button
          key={key}
          onClick={() => nav(key as PageKey)}
          style={{
            padding: "0.75rem 1rem",
            textAlign: "left",
            background:
              state.currentPage === key ? "#1e3a8a" : "transparent",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Topbar({ state }: { state: AppState }) {
  return (
    <div
      style={{
        height: "56px",
        background: "#1e293b",
        color: "white",
        display: "flex",
        alignItems: "center",
        padding: "0 1rem",
        borderBottom: "1px solid #334155",
      }}
    >
      <div style={{ fontWeight: 600 }}>{state.currentPage}</div>
    </div>
  );
}

/* -------------------------------------------------------
   APP COMPONENT — START
------------------------------------------------------- */

export default function App() {
  const [data, setData] = useState<AppData>(loadData());
  const [state, setState] = useState<AppState>({
    currentPage: "SHOP_FLOOR",
    currentRole: "SERVICE_ADVISOR",
    currentIntakeId: undefined,
  });

  useEffect(() => {
    saveData(data);
  }, [data]);

  /* -------------------------------------------------------
     CREATE INTAKE
  ------------------------------------------------------- */

  const createIntake = (
    customer: Customer,
    vehicle: Vehicle,
    concern: string
  ) => {
    const intake: Intake = {
      id: id("intake"),
      customerId: customer.id,
      vehicleId: vehicle.id,
      plate: vehicle.plate,
      concern,
      walkaround: {},
    };

    setData((prev) => ({
      ...prev,
      intakes: [...prev.intakes, intake],
    }));

    return intake;
  };
  /* -------------------------------------------------------
     WALKAROUND UPDATE + COMPLETE
  ------------------------------------------------------- */

  const updateIntakeWalkaround = (
    intakeId: string,
    updates: Partial<Intake["walkaround"]>
  ) => {
    setData((prev) => ({
      ...prev,
      intakes: prev.intakes.map((i) =>
        i.id === intakeId
          ? { ...i, walkaround: { ...i.walkaround, ...updates } }
          : i
      ),
    }));
  };

  const completeWalkaround = (intakeId: string) => {
    alert("Walkaround completed!");
    setState((prev) => ({
      ...prev,
      currentPage: "INSPECTION",
    }));
  };

  /* -------------------------------------------------------
     INTAKE PAGE
  ------------------------------------------------------- */

  function IntakePage({
    data,
    createIntake,
    setState,
  }: {
    data: AppData;
    createIntake: any;
    setState: any;
  }) {
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [plate, setPlate] = useState("");
    const [vin, setVin] = useState("");
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState<number | "">("");
    const [concern, setConcern] = useState("");

    const handleStartIntake = () => {
      const customer: Customer = {
        id: id("cust"),
        name: customerName,
        phone: customerPhone,
      };

      const vehicle: Vehicle = {
        id: id("veh"),
        customerId: customer.id,
        plate,
        vin,
        make,
        model,
        year: Number(year),
      };

      const intake = createIntake(customer, vehicle, concern);

      setState((prev: AppState) => ({
        ...prev,
        currentPage: "WALKAROUND",
        currentIntakeId: intake.id,
      }));
    };

    return (
      <div style={{ padding: "1rem", color: "white" }}>
        <h2 style={{ marginBottom: "1rem" }}>New Intake</h2>

        <div style={{ marginBottom: "1rem" }}>
          <div>Customer Name</div>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <div>Phone</div>
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <div>Plate</div>
          <input
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <div>VIN</div>
          <input
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <div>Make</div>
          <input
            value={make}
            onChange={(e) => setMake(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <div>Model</div>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <div>Year</div>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <div>Customer Concern</div>
          <textarea
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", height: "100px" }}
          />
        </div>

        <button
          onClick={handleStartIntake}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: "#1e3a8a",
            color: "white",
            border: "none",
            borderRadius: "0.375rem",
          }}
        >
          Start Walkaround
        </button>
      </div>
    );
  }

  /* -------------------------------------------------------
     WALKAROUND PAGE (FULL WIZARD)
  ------------------------------------------------------- */

  function WalkaroundPage({
    intake,
    updateIntake,
    completeWalkaround,
  }: {
    intake: Intake;
    updateIntake: (
      intakeId: string,
      updates: Partial<Intake["walkaround"]>
    ) => void;
    completeWalkaround: (intakeId: string) => void;
  }) {
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    const goNext = () => step < totalSteps && setStep(step + 1);
    const goBack = () => step > 1 && setStep(step - 1);

    const handlePhoto = (
      field: keyof Intake["walkaround"],
      file: File | null
    ) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        updateIntake(intake.id, { [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    };
    /* -------------------- STEP COMPONENTS -------------------- */

    const StepPhotos = () => (
      <div style={{ padding: "1rem" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
          Vehicle Photos
        </h2>

        {[
          { label: "Front", field: "frontPhoto" },
          { label: "Left Side", field: "leftPhoto" },
          { label: "Rear", field: "rearPhoto" },
          { label: "Right Side", field: "rightPhoto" },
        ].map(({ label, field }) => (
          <div
            key={field}
            style={{
              marginBottom: "1.25rem",
              padding: "1rem",
              border: "1px solid #1f2937",
              borderRadius: "0.5rem",
              background: "#0f172a",
            }}
          >
            <div style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
              {label}
            </div>

            {intake.walkaround[field] ? (
              <img
                src={intake.walkaround[field] as string}
                style={{
                  width: "100%",
                  borderRadius: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "160px",
                  background: "#1e293b",
                  borderRadius: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              />
            )}

            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) =>
                handlePhoto(field as any, e.target.files?.[0] || null)
              }
              style={{
                width: "100%",
                padding: "0.6rem",
                background: "#1e3a8a",
                color: "white",
                borderRadius: "0.375rem",
                border: "none",
              }}
            />
          </div>
        ))}
      </div>
    );

    const StepTireDepth = () => (
      <div style={{ padding: "1rem" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
          Tire Depth
        </h2>

        {[
          { label: "Left Front (LF)", field: "lfDepth" },
          { label: "Right Front (RF)", field: "rfDepth" },
          { label: "Left Rear (LR)", field: "lrDepth" },
          { label: "Right Rear (RR)", field: "rrDepth" },
        ].map(({ label, field }) => (
          <div key={field} style={{ marginBottom: "1rem" }}>
            <div style={{ marginBottom: "0.25rem" }}>{label}</div>
            <input
              type="number"
              value={intake.walkaround[field] ?? ""}
              onChange={(e) =>
                updateIntake(intake.id, { [field]: Number(e.target.value) })
              }
              placeholder="Depth (mm)"
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "0.375rem",
                border: "1px solid #374151",
                background: "#0f172a",
                color: "#e5e7eb",
              }}
            />
          </div>
        ))}
      </div>
    );

    const StepDamageNotes = () => (
      <div style={{ padding: "1rem" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
          Damage Notes
        </h2>

        <textarea
          value={intake.walkaround.damageNotes ?? ""}
          onChange={(e) =>
            updateIntake(intake.id, { damageNotes: e.target.value })
          }
          placeholder="Describe any visible damage..."
          style={{
            width: "100%",
            height: "180px",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #374151",
            background: "#0f172a",
            color: "#e5e7eb",
          }}
        />
      </div>
    );

    const StepOdometer = () => (
      <div style={{ padding: "1rem" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
          Odometer
        </h2>

        <input
          type="number"
          value={intake.walkaround.odometer ?? ""}
          onChange={(e) =>
            updateIntake(intake.id, { odometer: Number(e.target.value) })
          }
          placeholder="Enter odometer reading"
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #374151",
            background: "#0f172a",
            color: "#e5e7eb",
          }}
        />
      </div>
    );

    const StepReview = () => (
      <div style={{ padding: "1rem" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>Review</h2>

        <div
          style={{
            padding: "1rem",
            borderRadius: "0.5rem",
            background: "#0f172a",
            border: "1px solid #1f2937",
          }}
        >
          <div style={{ marginBottom: "0.75rem" }}>
            <strong>Plate:</strong> {intake.plate}
          </div>

          <div style={{ marginBottom: "0.75rem" }}>
            <strong>Odometer:</strong> {intake.walkaround.odometer ?? "—"}
          </div>

          <div style={{ marginBottom: "0.75rem" }}>
            <strong>Damage Notes:</strong>
            <div>{intake.walkaround.damageNotes || "None"}</div>
          </div>

          <div>
            <strong>Tire Depth:</strong>
            <pre style={{ marginTop: "0.5rem" }}>
{JSON.stringify(
  {
    LF: intake.walkaround.lfDepth,
    RF: intake.walkaround.rfDepth,
    LR: intake.walkaround.lrDepth,
    RR: intake.walkaround.rrDepth,
  },
  null,
  2
)}
            </pre>
          </div>
        </div>

        <button
          onClick={() => completeWalkaround(intake.id)}
          style={{
            width: "100%",
            marginTop: "1.5rem",
            padding: "0.9rem",
            borderRadius: "0.5rem",
            background: "#166534",
            color: "white",
            border: "none",
            fontWeight: 600,
          }}
        >
          Complete Walkaround
        </button>
      </div>
    );

    const renderStep = () => {
      switch (step) {
        case 1:
          return <StepPhotos />;
        case 2:
          return <StepTireDepth />;
        case 3:
          return <StepDamageNotes />;
        case 4:
          return <StepOdometer />;
        case 5:
          return <StepReview />;
        default:
          return <StepPhotos />;
      }
    };

    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#020617",
          color: "#e5e7eb",
        }}
      >
        <div
          style={{
            padding: "1rem",
            borderBottom: "1px solid #1f2937",
            fontSize: "1.1rem",
            fontWeight: 600,
          }}
        >
          Walkaround — Step {step} / {totalSteps}
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>{renderStep()}</div>

        <div
          style={{
            padding: "1rem",
            borderTop: "1px solid #1f2937",
            display: "flex",
            justifyContent: "space-between",
            background: "#0f172a",
          }}
        >
          <button
            onClick={goBack}
            disabled={step === 1}
            style={{
              flex: 1,
              marginRight: "0.5rem",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              background: step === 1 ? "#1e293b" : "#374151",
              color: "#e5e7eb",
              border: "none",
            }}
          >
            Back
          </button>

          <button
            onClick={goNext}
            disabled={step === totalSteps}
            style={{
              flex: 1,
              marginLeft: "0.5rem",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              background: step === totalSteps ? "#1e293b" : "#1e3a8a",
              color: "white",
              border: "none",
            }}
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     SHOP FLOOR PAGE (PLACEHOLDER)
  ------------------------------------------------------- */

  function ShopFloorPage() {
    return (
      <div style={{ padding: "1rem", color: "white" }}>
        <h2>Shop Floor</h2>
        <p>Vehicles in progress will appear here.</p>
      </div>
    );
  }

  /* -------------------------------------------------------
     PAGE ROUTER
  ------------------------------------------------------- */

  const renderPage = () => {
    switch (state.currentPage) {
      case "SHOP_FLOOR":
        return <ShopFloorPage />;

      case "INTAKE":
        return (
          <IntakePage
            data={data}
            createIntake={createIntake}
            setState={setState}
          />
        );

      case "WALKAROUND":
        return (
          <WalkaroundPage
            intake={data.intakes.find(
              (i) => i.id === state.currentIntakeId
            )!}
            updateIntake={updateIntakeWalkaround}
            completeWalkaround={completeWalkaround}
          />
        );

      default:
        return (
          <div style={{ padding: "1rem", color: "white" }}>
            <h2>{state.currentPage}</h2>
            <p>Page not implemented yet.</p>
          </div>
        );
    }
  };

  /* -------------------------------------------------------
     APP LAYOUT
  ------------------------------------------------------- */

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar state={state} setState={setState} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar state={state} />
        <div style={{ flex: 1, overflow: "auto" }}>{renderPage()}</div>
      </div>
    </div>
  );
}
