import React, {Component} from 'react';
import {Tabs, Tab, Modal, Button} from 'react-bootstrap';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ErrorIndicator from './ErrorIndicator';
import StackGrid from "react-stack-grid";
// import LoadingIndicator from './LoadingIndicator';

import {getClients, getImages, getImagesByClient, getImagesByType} from './api'

const translations = {
    working: "工作中",
    error: "发生故障",

    unknown: '不明生物',
    dog: '狗',
    cat: '猫',
    bird: '鸟',
    tiger: '老虎',
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

        this.loadClients();
        this.loadImages();
        setInterval(this.loadClients, 10 * 1000);
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
        return (
            <div className="App">
                <div className="App-header">
                    <h2>"野生动物在哪里"管理界面</h2>
                    <p className="App-intro">
                        您可以检查摄像头节点的工作状态,并查看拍摄的照片
                    </p>
                </div>
                <div className="container">
                    {errors.length > 0 && <ErrorIndicator errors={errors}/>}
                    <br/>
                    <Tabs id="chooser-tabs" onSelect={this.onSelectTab}>
                        <Tab eventKey={'image'} title="照片">
                            <h3>
                                <span>已经上传的图片数量: </span>
                                <span className="label label-info">{images.length}</span>
                            </h3>
                            <form className="form-inline">
                                <div className="form-group">
                                    <label htmlFor="selectedClientId">筛选节点编号</label>
                                    <select className="form-control" name="selectedClientId" value={selectedClientId}
                                            onChange={this.onChange}>
                                        <option key={"opt-0"} value="">-</option>
                                        {
                                            clientIds.map((id, index) =>
                                                <option key={`opt-${index + 1}`} value={id}>{id}</option>
                                            )
                                        }
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="selectedType">筛选动物类型</label>
                                    <select className="form-control" name="selectedType" value={selectedType}
                                            onChange={this.onChange}>
                                        <option key={"opt-0"} value="">-</option>
                                        {
                                            imageTypes.map((type, index) =>
                                                <option key={`opt-${index + 1}`} value={type}>{type}</option>
                                            )
                                        }
                                    </select>
                                </div>
                            </form>
                            <StackGrid columnWidth={200} monitorImagesLoaded={true}>
                                {
                                    images.map((image, index) =>
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
                        <Tab eventKey={'client'} title="摄像头节点">
                            <h3>
                                <span>摄像头节点数量: </span>
                                <span className="label label-info">{clients.length}</span>
                            </h3>
                            <table className="table table-bordered">
                                <thead>
                                <tr>
                                    <th>编号</th>
                                    <th>状态</th>
                                    <th>电量</th>
                                    <th>距离上次活跃</th>
                                </tr>
                                </thead>
                                <tbody style={{textAlign: 'left'}}>
                                {
                                    clients.map((client, index) => <tr key={`client-${index}`}>
                                        <td>{client.id}</td>
                                        <td className={client.status === 'error' ? 'bg-danger' : ''}>
                                            {translations[client.status]}
                                        </td>
                                        <td className={client.battery < 20 ? 'bg-warning' : ''}>
                                            {`${client.battery}%`}
                                        </td>
                                        <td className={(Date.now() - client.atime) > 5 * 60 * 1000 ? 'bg-danger' : ''}>
                                            {
                                                parseInt((Date.now() - client.atime) / 1000 / 60) + ' 分钟, '
                                                + parseInt((Date.now() - client.atime) / 1000 % 60) + ' 秒'
                                            }
                                        </td>
                                    </tr>)
                                }
                                </tbody>
                            </table>
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
                            <h4>
                                在
                                <span className="label label-info">
                                    {new Date(selectedImage.create_time).toGMTString()}
                                </span>
                                , 它被结点
                                <span className="label label-success">{selectedImage.client_id}</span>
                                发现.
                            </h4>
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
