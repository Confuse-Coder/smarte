import { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import _ from 'lodash';
import { CSVLink } from 'react-csv';
import Papa from 'papaparse';
import { toast } from 'react-toastify';

const TableUsers = (props) => {
  const [listUsers, setListUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [dataExport, setDataExport] = useState([]);

  const getUsersExport = (event, done) => {
    let result = [];
    if (listUsers && listUsers.length > 0) {
      result.push(['email', 'name', 'phone', 'address', 'note']);
      listUsers.map((item, index) => {
        let arr = [];
        arr[0] = item.email;
        arr[1] = item.name;
        arr[2] = item.phone;
        arr[3] = item.address;
        arr[4] = item.note;
        result.push(arr);
      });
      setDataExport(result);
      done();
    }
  };

  const handleImportCSV = (event) => {
    if (event.target && event.target.files && event.target.files[0]) {
      let file = event.target.files[0];
      if (file.type !== 'text/csv') {
        toast.error('Only accept CSV files!!!');
        return;
      }

      const regEmail = /(^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$)/;
      const regPhone = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;
      const regName = /(^[A-Za-z][A-Za-z0-9_]{2,}$)/;

      Papa.parse(file, {
        complete: function (results) {
          let rawCSV = results.data;
          if (rawCSV.length > 0) {
            if (rawCSV[0] && rawCSV[0].length === 5) {
              if (
                rawCSV[0][0] !== 'email' ||
                rawCSV[0][1] !== 'name' ||
                rawCSV[0][2] !== 'phone' ||
                rawCSV[0][3] !== 'address' ||
                rawCSV[0][4] !== 'note'
              ) {
                toast.error('Wrong format Header!');
              } else {
                let result = [];
                rawCSV.map((item, index) => {
                  if (index > 0 && item.length === 5) {
                    let obj = {};
                    obj.email = regEmail.test(item[0].trim()) ? item[0] : '';
                    obj.name = regName.test(item[1].trim()) ? item[1] : '';
                    obj.phone = regPhone.test(item[2].trim()) ? item[2] : '';
                    obj.address = item[3];
                    obj.note = item[4];
                    result.push(obj);
                  }
                });
                toast.success('Import OK!');
                setListUsers(result);
              }
            } else {
              toast.error('Wrong format CSV file!');
            }
          } else {
            toast.error('Not found data on CSV file!');
          }
        },
      });
    }
  };

  return (
    <>
      <div className="col-4 my-3">
        <div className="group-btns">
          <label htmlFor="test" className="btn btn-warning">
            Import
          </label>
          <input type="file" id="test" hidden onChange={(event) => handleImportCSV(event)} />
          <CSVLink
            filename={'users.csv'}
            className="btn btn-primary my-2"
            data={dataExport}
            asyncOnClick={true}
            onClick={getUsersExport}
          >
            Export File
          </CSVLink>
        </div>
      </div>
      <Table striped bordered hover>
        <thead>
          {listUsers.length > 0 ? (
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Note</th>
            </tr>
          ) : (
            ''
          )}
        </thead>
        <tbody>
          {listUsers &&
            listUsers.length > 0 &&
            listUsers.map((item, index) => {
              return (
                <tr key={`users-${index}`}>
                  <td>{item.email}</td>
                  <td>{item.name}</td>
                  <td>{item.phone}</td>
                  <td>{item.address}</td>
                  <td>{item.note}</td>
                </tr>
              );
            })}
        </tbody>
      </Table>
    </>
  );
};

export default TableUsers;
