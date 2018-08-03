import React, {Component} from 'react';
import {Tabs, Tab, Modal, Button} from 'react-bootstrap';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ErrorIndicator from './ErrorIndicator';
import StackGrid from "react-stack-grid";

import {getClients, getImages, getImagesByClient, getImagesByType} from './api'

const translations = {
    working: "工作中",
    error: "发生故障",

    unknown: '不明生物',
    animal: '动物',
    dog: '动物',
    cat: '动物',
    bird: '动物',
    tiger: '动物',
    bear: '动物',
    deer: '动物',
    goat: '动物',
    wolf: '动物',
};

class App extends Component {

    constructor() {
        super();
        this.state = {
            processing: false,
            errors: [],
            clientIds: [],
            imageTypes: [],
            selectedClientId: '',
            selectedType: '',
            images: [],
            clients: [],
            showModal: false,
            selectedImage: {},
        };

        this.onSelectTab = this.onSelectTab.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onOpenModal = this.onOpenModal.bind(this);
        this.onCloseModal = this.onCloseModal.bind(this);
        this.loadImages = this.loadImages.bind(this);
        this.loadClients = this.loadClients.bind(this);

        // this.loadClients();
        this.loadImages();
        // setInterval(this.loadClients, 10 * 1000);
        setInterval(this.loadImages, 10 * 1000);
    }

    onSelectTab(name) {

    }

    onChange(event) {
        const {name, value} = event.target;
        const obj = {};
        obj[name] = value;
        switch (name) {
            case 'selectedType':
                obj.selectedClientId = '';
                break;
            case 'selectedClientId':
                obj.selectedType = '';
                break;
        }
        this.setState(obj);
        setTimeout(this.loadImages, 100);
    }

    loadImages() {
        const that = this;
        const {selectedType, selectedClientId} = this.state;
        const needUpdateType = !(selectedType || selectedClientId);

        let job = null;
        if (selectedType) {
            job = getImagesByType(selectedType);
        } else if (selectedClientId) {
            job = getImagesByClient(selectedClientId);
        } else {
            job = getImages();
        }

        job.then((data) => {
            const obj = {};
            obj.images = data.payload.result;
            if (needUpdateType) {
                const types = {};
                obj.images.map((image) =>
                    types[image.type] = true
                );
                obj.imageTypes = Object.keys(types);
            }
            that.setState(obj);
        })
            .catch((error) => {
                const errors = [error.toString()];
                that.setState({errors});
            });
    }

    loadClients() {
        const that = this;
        getClients()
            .then((data) => {
                const obj = {};
                obj.clientIds = Object.keys(data.result);
                obj.clients = obj.clientIds.map((k) => {
                    const o = JSON.parse(data.result[k]);
                    o.id = k;
                    return o;
                });
                that.setState(obj);
            })
            .catch((error) => {
                const errors = [error.toString()];
                that.setState({errors});
            });
    }

    onCloseModal() {
        this.setState({showModal: false});
    }

    onOpenModal(selectedImage) {
        console.log(selectedImage);
        this.setState({showModal: true, selectedImage});
    }

    render() {
        const {
            errors, images, clients, imageTypes, clientIds, selectedClientId, selectedType, showModal, selectedImage
        } = this.state;

        const animals_images = images.filter(im => im.type !== 'unknown');
        const unknown_images = images.filter(im => im.type === 'unknown');

        return (
            <div className="App">
                <div className="App-header">
                    <h2>"野生动物在哪里"管理界面</h2>
                    <p className="App-intro">
                        您可以查看用户拍摄的照片
                    </p>
                </div>
                <div className="container">
                    {errors.length > 0 && <ErrorIndicator errors={errors}/>}
                    <br/>
                    <Tabs id="chooser-tabs" onSelect={this.onSelectTab}>
                        <Tab eventKey={'image'} title="照片">
                            <h2>
                                <span>已经上传的图片数量: </span>
                                <span className="label label-info">{images.length}</span>
                            </h2>
                            <h2>动物</h2>
                            <StackGrid columnWidth={200} monitorImagesLoaded={true}>
                                {
                                    animals_images.map((image, index) =>
                                        <div key={`img-${index}`} className="img-pointer img-hover">
                                            <img
                                                onClick={() => this.onOpenModal(image)}
                                                src={`/api/images/bucket/thumbnails-small-color/img/${image.name}`}
                                            />
                                        </div>
                                    )
                                }
                            </StackGrid>
                            <hr/>
                            <h2>不明生物</h2>
                            <StackGrid columnWidth={200} monitorImagesLoaded={true}>
                                {
                                    unknown_images.map((image, index) =>
                                        <div key={`img-${index}`} className="img-pointer img-hover">
                                            <img
                                                onClick={() => this.onOpenModal(image)}
                                                src={`/api/images/bucket/thumbnails-small-color/img/${image.name}`}
                                            />
                                        </div>
                                    )
                                }
                            </StackGrid>
                        </Tab>
                    </Tabs>
                    <Modal show={showModal} onHide={this.onCloseModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>查看图片</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <h3>
                                有
                                <span className="label label-warning">
                                    {selectedImage.possibility}
                                </span>
                                %的可能性为一只
                                <span className="label label-primary">
                                    {translations[selectedImage.type]}
                                </span>
                            </h3>
                            <hr />
                            <img width={"100%"} src={`/api/images/bucket/images/img/${selectedImage.name}`}/>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.onCloseModal}>关闭</Button>
                        </Modal.Footer>
                    </Modal>
                    <br/>
                </div>
                <hr/>
            </div>
        );
    }
}

export default App;
