import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

const createInitialState = () => {
    return [
        {
            image: "./image1.jpg",
            content: "B 1023 C",
            validation: "false"
        },
        {
            image: "./image1.jpg",
            content: "B 1023 C",
            validation: "false"
        },
        {
            image: "./image1.jpg",
            content: "B 1023 C",
            validation: "false"
        },
        {
            image: "./image1.jpg",
            content: "B 1023 C",
            validation: "false"
        }
    ];
};

class App extends Component {
    state = {
        data: createInitialState()
    };

    createCSV = data => {
        const prevData = this.state.data;

        let csvContent = "data:text/csv;charset=utf-8,";
        for (let item of prevData) {
            let row = `${item.image},${item.content}, ${item.validation}`;
            csvContent += row + "\r\n";
        }

        const encodedUri = encodeURI(csvContent);
        window.open(encodedUri);
    };

    handleChange = (event, index) => {
        const prevData = this.state.data;
        const newData = [...prevData];
        newData[index] = {
            ...newData[index],
            validation: event.target.value
        };

        this.setState({
            data: newData
        });
    };

    readSingleFile = evt => {
        const f = evt.target.files[0];
        if (f) {
            const r = new FileReader();
            r.onload = e => {
                const contents = e.target.result;

                let data = contents.split("\r\n");
                data = data.map(item => {
                    const row = item.split(",");
                    const output = {
                        image: row[0],
                        content: row[1],
                        validation: row[2].replace(/\s/g, "")
                    };

                    return output;
                });

                console.log(data);
                this.setState({ data });
            };
            r.readAsText(f);
        } else {
            alert("Failed to load file");
        }
    };

    render() {
        const { data } = this.state;

        const imagesList = data.map(item => {
            return (
                <div className="datapoint">
                    <img src={item.image} />
                </div>
            );
        });

        const contentsList = data.map(item => {
            return (
                <div className="datapoint">
                    <h1>{item.content}</h1>
                </div>
            );
        });

        const validationsList = data.map((item, index) => {
            return (
                <div className="validation">
                    <form>
                        <input
                            type="radio"
                            name="validation"
                            value="true"
                            checked={item.validation === "true"}
                            onChange={e => this.handleChange(e, index)}
                        />
                        <h2>True</h2>
                        <br />
                        <input
                            type="radio"
                            name="validation"
                            value="false"
                            checked={item.validation === "false"}
                            onChange={e => this.handleChange(e, index)}
                        />
                        <h2>False</h2>
                        <br />
                    </form>
                </div>
            );
        });

        return (
            <div>
                <div className="app">
                    <header>
                        <h1 className="app-title">
                            License Plate Validation Tools
                        </h1>
                    </header>
                    <br />
                    <div className="button-container">
                        <input
                            type="file"
                            id="fileinput"
                            onChange={e => this.readSingleFile(e)}
                        />
                    </div>
                    <br />
                    <div className="container">
                        <div>Images </div>
                        {imagesList}
                    </div>
                    <div className="container">
                        <div>Contents </div>
                        {contentsList}
                    </div>
                    <div className="container">
                        <div>Validator</div>
                        <div>{validationsList}</div>
                    </div>
                </div>
                <div className="button-container">
                    <button onClick={() => this.createCSV(this.state)}>
                        Save as CSV
                    </button>
                    <button onClick={() => this.createPDF(this.state)}>
                        Save as PDF
                    </button>
                </div>
            </div>
        );
    }
}

export default App;
