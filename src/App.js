import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

const createInitialState = () => {
    return [];
};

class App extends Component {
    state = {
        onSave: false,
        stats: {
            content: 0,
            validated: 0,
            blur: 0,
            validatedBlur: 0,
            validatedNotBlur: 0,
            notValidatedBlur: 0,
            notValidatedNotBlur: 0,
        },
        data: createInitialState(),
    };

    createCSV = (data) => {
        const prevData = this.state.data;

        let csvContent = 'data:text/csv;charset=utf-8,';
        for (let item of prevData) {
            let row = `${item.image},${item.content}, ${item.validation}`;
            csvContent += row + '\r\n';
        }

        const encodedUri = encodeURI(csvContent);
        window.open(encodedUri);
    };

    processStats = (data) => {
        const validated = data
            .map((item) => (item.validation === 'true' ? 1 : 0))
            .reduce((accumulator, currentValue) => accumulator + currentValue);

        const blur = data
            .map((item) => (item.blur === 'true' ? 1 : 0))
            .reduce((accumulator, currentValue) => accumulator + currentValue);

        const validatedBlur = data
            .map(
                (item) =>
                    item.validation === 'true' && item.blur === 'true' ? 1 : 0
            )
            .reduce((accumulator, currentValue) => accumulator + currentValue);

        const validatedNotBlur = data
            .map(
                (item) =>
                    item.validation === 'true' && item.blur === 'false' ? 1 : 0
            )
            .reduce((accumulator, currentValue) => accumulator + currentValue);

        const notValidatedBlur = data
            .map(
                (item) =>
                    item.validation === 'false' && item.blur === 'true' ? 1 : 0
            )
            .reduce((accumulator, currentValue) => accumulator + currentValue);

        const notValidatedNotBlur = data
            .map(
                (item) =>
                    item.validation === 'false' && item.blur === 'false' ? 1 : 0
            )
            .reduce((accumulator, currentValue) => accumulator + currentValue);

        const stats = {
            ...this.stats,
            content: data.length,
            validated,
            blur,
            validatedBlur,
            validatedNotBlur,
            notValidatedBlur,
            notValidatedNotBlur,
        };

        return stats;
    };

    handleValidationChange = (event, index) => {
        const prevData = this.state.data;
        const newData = [...prevData];
        newData[index] = {
            ...newData[index],
            validation: event.target.value,
        };

        this.setState({
            data: newData,
            stats: this.processStats(newData),
        });
    };

    handleBlurChange = (event, index) => {
        const prevData = this.state.data;
        const newData = [...prevData];
        newData[index] = {
            ...newData[index],
            blur: event.target.value,
        };

        this.setState({
            data: newData,
            stats: this.processStats(newData),
        });
    };

    createPDF = () => {
        this.setState({ ...this.state, onSave: true }, () => {
            axios.get('http://localhost:8000/pdf').then((res) => {
                window.location.assign('/download.pdf');
                this.setState({ ...this.state, onSave: false });
            });
        });
    };

    handleOnUpload = () => {
        const data = new FormData();
        data.append('plateFile', document.getElementById('file').files[0]);

        axios.post('http://localhost:8000/upload', data).then((res) => {
            const response = res.data;

            console.log(response);

            this.setState({ ...this.state, data: response.data });
        });
    };

    render() {
        const { data, stats } = this.state;

        const imagesList = data.map((item) => {
            return (
                <div className="datapoint">
                    <img
                        src={`${item.image}`}
                        alt={`images-${item.image}`}
                        height={200}
                    />
                </div>
            );
        });

        const contentsList = data.map((item) => {
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
                            checked={item.validation === 'true'}
                            onChange={(e) =>
                                this.handleValidationChange(e, index)
                            }
                        />
                        <h2>True</h2>
                        <br />
                        <input
                            type="radio"
                            name="validation"
                            value="false"
                            checked={item.validation === 'false'}
                            onChange={(e) =>
                                this.handleValidationChange(e, index)
                            }
                        />
                        <h2>False</h2>
                        <br />
                    </form>
                </div>
            );
        });

        const blursList = data.map((item, index) => {
            return (
                <div className="blur">
                    <form>
                        <input
                            type="radio"
                            name="blur"
                            value="true"
                            checked={item.blur === 'true'}
                            onChange={(e) => this.handleBlurChange(e, index)}
                        />
                        <h2>True</h2>
                        <br />
                        <input
                            type="radio"
                            name="blur"
                            value="false"
                            checked={item.blur === 'false'}
                            onChange={(e) => this.handleBlurChange(e, index)}
                        />
                        <h2>False</h2>
                        <br />
                    </form>
                </div>
            );
        });

        let percentValidated = (stats.validated * 100) / stats.content;
        percentValidated = !!percentValidated ? percentValidated : 0;

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
                        <br />
                        <form role="form" className="form">
                            <div className="form-group">
                                <label htmlFor="file">File</label>
                                <input id="file" type="file" name="plateFile" />
                            </div>
                            <button
                                onClick={() => this.handleOnUpload()}
                                type="button"
                            >
                                Upload
                            </button>
                        </form>
                    </div>
                    <br />
                    <div id="pdf">
                        <div>Stats</div>
                        <div className="stats">
                            <div className="container">
                                <h2>Content: {this.state.stats.content} </h2>
                            </div>
                            <div className="container">
                                <h2>Validated: {this.state.stats.validated}</h2>
                            </div>
                            <div className="container">
                                <h2>Blur: {this.state.stats.blur}</h2>
                            </div>
                            <div className="container">
                                <h2>
                                    Accuracy:
                                    {percentValidated}%
                                </h2>
                            </div>
                            <div className="container">
                                <h2>
                                    Validated Blur:
                                    {this.state.stats.validatedBlur}
                                </h2>
                            </div>
                            <div className="container">
                                <h2>
                                    Validated Not Blur:
                                    {this.state.stats.validatedNotBlur}
                                </h2>
                            </div>
                            <div className="container">
                                <h2>
                                    Not Validated Blur:
                                    {this.state.stats.notValidatedBlur}
                                </h2>
                            </div>
                            <div className="container">
                                <h2>
                                    Not Validated Not Blur:
                                    {this.state.stats.notValidatedNotBlur}
                                </h2>
                            </div>
                        </div>
                        <div className="contents">
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
                            <div className="container">
                                <div>Blur</div>
                                <div>{blursList}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="button-container">
                    <button onClick={() => this.createCSV(this.state)}>
                        Save as CSV
                    </button>
                    <button onClick={() => this.createPDF()}>
                        {this.state.onSave ? 'Loading ...' : 'Save as PDF'}
                    </button>
                </div>
            </div>
        );
    }
}

export default App;
