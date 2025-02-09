const RB = ReactBootstrap;
const { Alert, Card, Button, Table } = ReactBootstrap;


const firebaseConfig = {
    apiKey: "AIzaSyDk_Z-euCdPvd0dsBb5WCyYpMfpj8FWkZo",
    authDomain: "webapphye.firebaseapp.com",
    projectId: "webapphye",
    storageBucket: "webapphye.firebasestorage.app",
    messagingSenderId: "220807614103",
    appId: "1:220807614103:web:ba4403a418ba45dcf9a3d2",
    measurementId: "G-Y3BQ3QN8YK"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function TextInput({ label, app, value, style }) {
    return (
        <label className="form-label">
            {label}:
            <input
                className="form-control"
                style={style}
                value={app.state[value]}
                onChange={(ev) => {
                    var s = {};
                    s[value] = ev.target.value;
                    app.setState(s);
                }}
            />
        </label>
    );
}

function StudentTable({ data, app }) {
    return (
        <Table className="table">
            <thead>
                <tr>
                    <th>รหัส</th>
                    <th>คำนำหน้า</th>
                    <th>ชื่อ</th>
                    <th>สกุล</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>จัดการ</th>
                </tr>
            </thead>
            <tbody>
                {data.map((s) => (
                    <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.title}</td>
                        <td>{s.fname}</td>
                        <td>{s.lname}</td>
                        <td>{s.email}</td>
                        <td>{s.phone}</td>
                        <td>
                            <Button variant="warning" onClick={() => app.editData(s)} style={{ marginRight: "10px" }}>แก้ไข</Button>
                            <Button variant="danger" onClick={() => app.deleteData(s.id)}>ลบ</Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scene: 0,
            students: [],
            stdid: "",
            stdtitle: "",
            stdfname: "",
            stdlname: "",
            stdemail: "",
            stdphone: "",
            user: null 
        };
    }

    componentDidMount() {
       
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.setState({ user: user });
            } else {
                this.setState({ user: null });
            }
        });
    }

    googleLogin = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope("profile");
        provider.addScope("email");
        firebase.auth().signInWithPopup(provider)
            .catch((error) => {
                console.error("Login error:", error);
            });
    };

  
    googleLogout = () => {
        if (confirm("Are you sure you want to logout?")) {
            firebase.auth().signOut()
                .catch((error) => {
                    console.error("Logout error:", error);
                });
        }
    };


    insertData = () => {
        db.collection("students").doc(this.state.stdid).set({
            title: this.state.stdtitle,
            fname: this.state.stdfname,
            lname: this.state.stdlname,
            phone: this.state.stdphone,
            email: this.state.stdemail,
        }, { merge: true })
        .then(() => {
            console.log("Data Saved!");
            this.setState({
                stdid: "",
                stdtitle: "",
                stdfname: "",
                stdlname: "",
                stdemail: "",
                stdphone: "",
            });
        }).catch((error) => {
            console.error("Error writing document:", error);
        });
    };

    readData = () => {
        db.collection("students").get().then((querySnapshot) => {
            let stdlist = [];
            querySnapshot.forEach((doc) => {
                stdlist.push({ id: doc.id, ...doc.data() });
            });
            this.setState({ students: stdlist });
        });
    };

    autoRead = () => {
        db.collection("students").onSnapshot((querySnapshot) => {
            let stdlist = [];
            querySnapshot.forEach((doc) => {
                stdlist.push({ id: doc.id, ...doc.data() });
            });
            this.setState({ students: stdlist });
        });
    };
//ลบข้อมูล
    deleteData = (stdid) => {
        if (confirm("ต้องการลบข้อมูลนี้หรือไม่?")) {
            db.collection("students").doc(stdid).delete()
            .then(() => console.log("Data Deleted!"))
            .catch((error) => console.error("Error deleting document:", error));
        }
    };

    editData = (std) => {
        this.setState({
            stdid: std.id,
            stdtitle: std.title,
            stdfname: std.fname,
            stdlname: std.lname,
            stdemail: std.email,
            stdphone: std.phone,
        });
    };

    render() {
        return (
            <Card>
                <Card.Header>
                    <Alert variant="info">
                        <b>Work6 :</b> Firebase
                    </Alert>
                </Card.Header>
                <Card.Body>
                    {/* Add login/logout section */}
                    <div className="mb-3">
                        {this.state.user ? (
                            <div>
                                <div className="d-flex align-items-center mb-2">
                                    <img 
                                        src={this.state.user.photoURL} 
                                        alt="Profile" 
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "50%",
                                            marginRight: "10px"
                                        }}
                                    />
                                    <span>{this.state.user.displayName}</span>
                                </div>
                                <Button 
                                    variant="danger" 
                                    onClick={this.googleLogout}
                                    className="mb-3"
                                >
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <Button 
                                variant="primary" 
                                onClick={this.googleLogin}
                                className="mb-3"
                            >
                                Login with Google
                            </Button>
                        )}
                    </div>

                    {/* Only show data when logged in */}
                    {this.state.user && (
                        <>
                            <Button onClick={this.readData} style={{ marginRight: "10px" }}>Read Data</Button>
                            <Button onClick={this.autoRead}>Auto Read</Button>
                            <div>
                                <StudentTable data={this.state.students} app={this} />
                            </div>
                        </>
                    )}
                </Card.Body>
                <Card.Footer>
                    {}
                    {this.state.user && (
                        <>
                            <b>เพิ่ม/แก้ไขข้อมูล นักศึกษา :</b>
                            <br />
                            <TextInput label="ID" app={this} value="stdid" style={{ width: 120, marginRight: "10px" }} />
                            <TextInput label="คำนำหน้า" app={this} value="stdtitle" style={{ width: 100, marginRight: "10px" }} />
                            <TextInput label="ชื่อ" app={this} value="stdfname" style={{ width: 120, marginRight: "10px" }} />
                            <TextInput label="สกุล" app={this} value="stdlname" style={{ width: 120, marginRight: "10px" }} />
                            <TextInput label="Email" app={this} value="stdemail" style={{ width: 150, marginRight: "10px" }} />
                            <TextInput label="Phone" app={this} value="stdphone" style={{ width: 120, marginRight: "10px" }} />
                            <Button onClick={this.insertData}>Save</Button>
                        </>
                    )}
                </Card.Footer>
            </Card>
        );
    }
}

const container = document.getElementById("myapp");
const root = ReactDOM.createRoot(container);
root.render(<App />);