import { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import _ from 'lodash';
import { CSVLink } from 'react-csv';
import Papa from 'papaparse';
import { toast } from 'react-toastify';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './TableUser.scss';

const TableUsers = (props) => {
  const [listUsers, setListUsers] = useState([]);
  const [dataExport, setDataExport] = useState([]);
  const [openPickerBtn, setOpenPickerBtn] = useState(false);
  const [sortBy, setSortBy] = useState('asc');
  const [sortField, setSortField] = useState('email');

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
    setOpenPickerBtn(true);
    if (event.target && event.target.files && event.target.files[0]) {
      let file = event.target.files[0];
      if (file.type !== 'text/csv') {
        toast.error('Only accept CSV files!!!');
        return;
      }

      const regEmail =
        /(^[^<>()[\]\\,;:\%#^\s@\"$&!@]+@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z0-9]+\.)+[a-zA-Z]{2,}))$)/;
      const regPhone = /\(?\+([84|0([0-9]\d)\)? ?-?[0-9]{5} ?-?[0-9]{4}/;
      const regName = /(^[A-Za-z.-]+(\s*[A-Za-z.-]+)*$)/;

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
                    obj.email = regEmail.test(item[0]) ? item[0] : '';
                    obj.name = regName.test(item[1]) ? item[1] : '';
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

  const handleSort = (sortBy, sortField) => {
    setSortBy(sortBy);
    setSortField(sortField);

    let cloneListUsers = _.cloneDeep(listUsers);
    cloneListUsers = _.orderBy(cloneListUsers, [sortField], [sortBy]);
    setListUsers(cloneListUsers);
  };
  const handleSearch = (event) => {
    let term = event.target.value;
    if (term) {
      let cloneListUsers = _.cloneDeep(listUsers);
      cloneListUsers = cloneListUsers.filter((item) => item.email.includes(term));
      setListUsers(cloneListUsers);
    }
  };

  return (
    <>
      <div className="row d-flex justify-content-between">
        <div className="col-12">
          <div className="text-line">
            <p>Tool sẽ lọc bỏ những lỗi như sau:</p>
            <ol>
              <li>Số điện thoại có string + ký tự đặc biệt</li>
              <li>Chỉ lấy mã vùng Việt Nam (+84123456789)</li>
              <li>Email rác dạng abc@gmail,...</li>
              <li>Tên có số + ký tự đặc biệt</li>
            </ol>
            <p>Các chức năng chính:</p>
            <ol>
              <li>Lọc theo Email(a-z) và Phone Number</li>
              <li>Search user by Name</li>
              <li>Download file text/csv (excel)</li>
            </ol>
          </div>
        </div>
        <div className="col-6 my-3">
          <div className="group-btns">
            <label htmlFor="test" className="btn btn-warning">
              Import
            </label>
            <input type="file" id="test" hidden onChange={(event) => handleImportCSV(event)} />
          </div>
          {openPickerBtn ? (
            <div className="search mt-2">
              <input
                className="form-control"
                placeholder="Search user by email"
                onChange={(event) => handleSearch(event)}
              />
            </div>
          ) : (
            ''
          )}
        </div>

        <div className="col-6 my-3 text-end">
          {openPickerBtn ? (
            <CSVLink
              filename={'users.csv'}
              className="btn btn-primary my-2"
              data={dataExport}
              asyncOnClick={true}
              onClick={getUsersExport}
            >
              Export
            </CSVLink>
          ) : (
            ''
          )}
        </div>
      </div>
      <Table striped bordered hover>
        <thead>
          {listUsers.length > 0 ? (
            <tr>
              <th className="sort-email">
                Email &nbsp;
                <span>
                  <i
                    className="fa-solid fa-arrow-down-long"
                    onClick={() => handleSort('desc', 'email')}
                  ></i>
                  <i
                    className="fa-solid fa-arrow-up-long"
                    onClick={() => handleSort('asc', 'email')}
                  ></i>
                </span>
              </th>
              <th className="sort-name">
                Name
                <span>
                  <i
                    className="fa-solid fa-arrow-down-long"
                    onClick={() => handleSort('desc', 'name')}
                  ></i>
                  <i
                    className="fa-solid fa-arrow-up-long"
                    onClick={() => handleSort('asc', 'name')}
                  ></i>
                </span>
              </th>
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
