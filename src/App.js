import React, { Component } from 'react';
import './config';
import * as firebase from 'firebase'
const $ = window.$;

export default class App extends Component{

  state = {
    nombre: "",
    apellido: "",
    edad: 0,
    fechaNac: "",
    allReg: [],
    promedioEdad: 0,
    varianzaEdad: 0
  }
  
  componentDidMount(){
    // Listando los registros
    this.getTodosEmpleados()
  }
  
  // Obtenemos los datos de la db
  getTodosEmpleados = () => {
    let allUserArray = [];
    let calPromedioEdad = 0;
    let calVarianza = 0;
    firebase
      .database()
      .ref("users")
      .once("value")
      .then(snapShot => {
        var count = 0,
          setPromedioEdad = 0,
          setVarianza = 0;
        // Recorremos todos para sacar el promedio
        snapShot.forEach(item => {
          count++;
          calPromedioEdad = calPromedioEdad + Number(item.val().edad)
          allUserArray.push({
            id: item.key,
            ...item.val()
          })
        });
        setPromedioEdad = (calPromedioEdad / count);
        // Recorremos nuevamente para obtener la varianza
        snapShot.forEach(item => {
          calVarianza += (Number(item.val().edad) - setPromedioEdad) ** 2
        });
        setVarianza = (Math.sqrt((calVarianza / (count - 1)))).toFixed(2);
        this.setState({
          allReg: allUserArray,
          promedioEdad: setPromedioEdad,
          varianzaEdad: setVarianza
        })
      })
  }

  /**
   * Calcula la fecha de una posible muerte!
   */
  fechaProbableMuerte = (fechaDeNacimiento, fechaActual) => {
    // Limita la edad hasta 82 años aprox
    let generateRandomNumber = function () {
      var min = 0.0200,
          max = 0.750,
          highlightedNumber = Math.random() * (max - min) + min;
      return highlightedNumber;
    };
    let  d = new Date(fechaDeNacimiento.getTime() + generateRandomNumber() * (fechaActual.getTime() + fechaDeNacimiento.getTime())),
      mes = '' + (d.getMonth() + 1),
      dia = '' + d.getDate(),
      anio = d.getFullYear();
    if (mes.length < 2) mes = '0' + mes;
    if (dia.length < 2) dia = '0' + dia;
    return [anio, mes, dia].join('-');
  }

  /**
   * Si damos guardar!
   */
  submit = e => {
    e.preventDefault();
    //
    firebase
      .database()
      .ref("users")
      .push({
        nombre: this.state.nombre,
        apellido: this.state.apellido,
        edad: this.state.edad,
        fechaNac: this.state.fechaNac,
        fechaDie: this.fechaProbableMuerte(
          new Date(this.state.fechaNac.split("-")[0], this.state.fechaNac.split("-")[1], this.state.fechaNac.split("-")[2]),
          new Date()
        )
      })
    this.getTodosEmpleados();
    // Cerramos el modal
    $('#addEmpleadoModal').modal('hide');
  }
  
  render(){
    return(
      <div className="container">
        <div className="table-wrapper">
          <div className="table-title">
            <div className="row">
              <div className="col-sm-6">
                <h2>Listado de <b>Empleados</b></h2>
              </div>
              <div className="col-sm-6">
                <a href="#addEmpleadoModal" className="btn btn-success" data-toggle="modal">
                  <i className="material-icons">&#xE147;</i> <span>Agregar nuevo empleado</span>
                </a>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <section className="cards">
                <div className="card card--oil">
                  <div className="card__count-container">
                    <div className="card__count-text">
                      <span className="card__count-text--big">{this.state.promedioEdad}</span>
                    </div>
                  </div>
                  <div className="card__stuff-container">
                    <div className="card__stuff-text"> - Promedio de edad</div>
                  </div>
                </div>
                <div className="card card--oil">
                  <div className="card__count-container">
                    <div className="card__count-text">
                      <span className="card__count-text--big">{this.state.varianzaEdad}</span>
                    </div>
                  </div>
                  <div className="card__stuff-container">
                    <div className="card__stuff-text"> - Desviación estándar</div>
                  </div>
                </div>
              </section>
            </div>
          </div>
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th> - </th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Edad</th>
                <th>Fecha de Nacimiento</th>
                <th>Fecha Probable de Muerte</th>
              </tr>
            </thead>
            <tbody>
              {this.state.allReg.map(function(persona, row){
                return (
                  <tr key={row}>
                    <td>{(row + 1)}</td>
                    <td>{persona.nombre}</td>
                    <td>{persona.apellido}</td>
                    <td>{persona.edad}</td>
                    <td>{persona.fechaNac}</td>
                    <td>{persona.fechaDie}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div id="addEmpleadoModal" className="modal fade">
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={ (e) => this.submit(e) }>
                <div className="modal-header">
                  <h4 className="modal-title">Agregar Empleado</h4>
                  <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input type="text" onChange={ e => this.setState({ nombre: e.target.value }) } className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label>Apellido</label>
                    <input type="text" onChange={ e => this.setState({ apellido: e.target.value }) } className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label>Edad</label>
                    <input type="text" onChange={ e => this.setState({ edad: e.target.value }) } className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label>Fecha de Nacimiento</label>
                    <input type="date" onChange={ e => this.setState({ fechaNac: e.target.value }) } className="form-control" required />
                  </div>
                </div>
                <div className="modal-footer">
                  <input type="button" className="btn btn-default" data-dismiss="modal" value="Cancelar" />
                  <input type="submit" className="btn btn-success" value="Agregar" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
