import axios from 'axios'
// import TimeMe from 'timeme.js';
import { saveformBuilderjson, updateLoaderFlag } from '../redux/folderSlice';
import fetchIntercept from 'fetch-intercept'
import store from '../redux/store'
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router';
import * as API from './API'

//url for production
export var url = "";
if (process.env.NODE_ENV === "development") {
  url = "";
} else {
  url = window.location.host.split("/")[1];
  if (url) {
    url = `/${window.location.host.split("/")[1]}`;
  } else url = process.env.PUBLIC_URL; /// ADD YOUR CPANEL SUB-URL
}

// Logs out user
export const handleSignout = () => {
  localStorage.removeItem("accessToken");
};

//Function to validate and return errors for a form
export const checkForm = (formData) => {
  let errorState = {};
  Object.keys(formData).forEach((item) => {
    if (formData[item] === null || formData[item] === "") {
      errorState[item] = "This field is required";
    }
  });
  return errorState;
};

//Function that returns the first or first two letters from a name
export const findUpper = (string) => {
  let extractedString = [];

  for (var i = 0; i < string.length; i++) {
    if (string.charAt(i) === string.charAt(i).toUpperCase() && string.charAt(i) !== " ") {
      extractedString.push(string.charAt(i));
    }
  }


  if (extractedString.length > 1) {
    return extractedString[0] + extractedString[1];
  } else {
    return extractedString[0];
  }
};

// export const findLogoName = (s) => {
//   return s?.split(' ')?.map((w) => w[0])?.join('')
// }

export const findLogoName = (s) => {
  return s?.split(' ')?.slice(0, 2)?.map((w) => w[0]?.toUpperCase())?.join('');
}

export const camelCaseToWords = (camelCaseString) => {
  const wordsArray = camelCaseString.split(/(?=[A-Z])|\s+/);
  const humanReadableString = wordsArray.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  if (humanReadableString.includes('Group')) {
    return humanReadableString.replace(/(View|Add|Delete|Update)user/g, '$1 User');
  } else {
    return humanReadableString;
  }
  // return humanReadableString;
}

//Function that calculates the from current date
export const setDeadline = (days) => {
  let todayDate = new Date();
  var newDate = new Date(todayDate);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

// Function to structure date ex : Jun 4, 2011;
export const getDateStructured = (date) => {
  let d = date.getDate();
  let m = date.getMonth();
  let y = date.getFullYear();
  let final = monthNames[m] + " " + d + ", " + y;
  return final;
};

// Function to structure date ex: YYYY-MM-DD
export const setDateForPicker = (rdate) => {
  let d = rdate.getDate();
  d < 10 && (d = "0" + d);
  let m = rdate.getMonth() + 1;
  m < 10 && (m = "0" + m);
  let y = rdate.getFullYear();
  rdate = y + "-" + m + "-" + d;

  return rdate;
};

// Set deadlines for projects
export const setDeadlineDays = (deadline) => {
  var currentDate = new Date();
  var difference = deadline.getTime() - currentDate.getTime();
  var days = Math.ceil(difference / (1000 * 3600 * 24));
  return days;
};

//Date formatter function
export const dateFormatterAlt = (date, reverse) => {
  let d = date.getDate();
  let m = date.getMonth() + 1;
  let y = date.getFullYear();
  reverse ? (date = m + " - " + d + " - " + y) : (date = y + " - " + d + " - " + m);
  return date;
};

//Date formatter function
export const dateFormatter = (date, reverse, string) => {
  var dateformat = date.split("-");
  //var date = dateformat[1]+"-"+dateformat[2]+"-"+dateformat[0];
  reverse
    ? (date = dateformat[2] + "-" + dateformat[0] + "-" + dateformat[1])
    : (date = dateformat[1] + "-" + dateformat[2] + "-" + dateformat[0]);

  return date;
};

//todays Date
export const todaysDate = new Date();

//current Time
export const currentTime = () => {
  var hours = todaysDate.getHours();
  var minutes = todaysDate.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
};

export const userTimezone = (utcString, tz) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }

  const reqTzDate = new Date(utcString).toLocaleString("en-US", { ...options, timeZone: tz })
  return reqTzDate //September 20, 2024 1:49 PM
}

export const viewUserTimezoneInDiffFormat = (utcString, tz) => {

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const reqTzDate = new Date(utcString).toLocaleString("en-US", { timeZone: tz });
  return formatDate(new Date(reqTzDate))
}

export const getTimezoneInDiffFormat = (utcString, tz) => {

  const formatDateTime = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    const sec = String(date.getSeconds()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${min}:${sec}`
  }

  const reqTzDate = new Date(utcString).toLocaleString("en-US", { timeZone: tz });
  return formatDateTime(new Date(reqTzDate))
}

//Percentage calculation
export const calcPercentage = (str1, str2) => {
  let result = Number(str2) / Number(str1);
  result = result * 100;
  return Math.floor(result);
};

export const truncate = (str, n) => {
  return str.length > n ? str.substr(0, n - 1) + " " + truncate(str.substr(n - 1, str.length), n) : str;
};

// returns upload url
export const getUploadParams = () => {
  return { url: "https://httpbin.org/post" };
};

export const bulkActionOptions = [
  { value: "suspend", label: "Suspend User" },
  { value: "delete", label: "Delete User" },
];

// Converts KB to MB
export const bytesToMegaBytes = (bytes) => {
  let result = bytes / (1024 * 1024);
  return result.toFixed(2);
};

export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const addDays = (date, days) => {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Returns Currency based value for invest panel
export const returnCurrency = (currency, data, upperCase) => {
  if (currency === "usd") {
    return { value: data.usd.toFixed(2), label: upperCase ? "USD" : "$" };
  } else if (currency === "eur") {
    return { value: data.euro.toFixed(2), label: upperCase ? "EUR" : "euro" };
  } else if (currency === "btc") {
    return { value: data.BTC.toFixed(6), label: "BTC" };
  } else {
    return { value: data.ETH.toFixed(2), label: "ETH" };
  }
};

// Returns levels
export const returnLevel = (currency, data, upperCase) => {
  if (currency === "usd") {
    return data.usd;
  } else if (currency === "eur") {
    return data.euro;
  } else if (currency === "btc") {
    let amount = data.BTC.map((item) => {
      return item.toFixed(6);
    });
    return amount;
  } else {
    return data.ETH;
  }
};


export const setupFetchInterceptor = () => {
  fetchIntercept.register({
    response: function (response) {

      const state = store.getState()
      // const id = state.folders.formBuilderId

      if (response.url == `${process.env.REACT_APP_BE_URL}/form/add`) {
        const dispatch = store.dispatch
        return response.json().then((data) => {
          dispatch(saveformBuilderjson(data))
          return data
        })
      }

      // if(response.url == `${process.env.REACT_APP_BE_URL}/form/get/${id}`){
      //   console.log(response,"Res")

      //   return response.json().then((data) => {
      //     // dispatch(saveformBuilderjson(data))
      //     return data
      //   })

      // }
      return response
    }
  })
}



export const setupAxios = () => {
  axios.defaults.headers.common['Accept'] = 'application/json';
  axios.interceptors.request.use(
    (config) => {
      if (config.url === '/login') {
        return config;
      }

      const token = localStorage.getItem('accessToken');
      const workspace_id = localStorage.getItem('workspace_id');
      if (token != null && workspace_id != null) {
        config.headers.Authorization = `Bearer ${token} ${workspace_id}`
      }
      if (workspace_id) {
        config.headers["workspace_id"] = `${workspace_id}`
      }

      return config;
    },
    (err) => {
      return Promise.reject(err)
    }
  )

  axios.interceptors.response.use(
    (response) => {

      return response;
    },
    (error) => {
      const requestUrl = error?.config?.url.toLowerCase()

      if (error?.response?.data && error?.response?.data?.['message'] == 'jwt expired') {
        localStorage.clear()
        window.location.href = `${process.env.PUBLIC_URL}/auth/login`
      }

      if (error?.response?.data?.['type'] == 'Plan Limitation') {
        const state = store.getState()
        const dispatch = store.dispatch
        let myworkspace = state.folders?.myworkspace

        const fetchWorkspaceIfNeeded = async () => {
          if (!myworkspace || myworkspace?.length == 0) {
            const workspaceResponse = await API.getmyworkspaceinfo()
            if (workspaceResponse?.status) {
              dispatch({ type: 'folders/setmyworkspaceinfo', payload: workspaceResponse.data })
              return workspaceResponse?.data
            }
            return []
          }
          return myworkspace
        }

        return fetchWorkspaceIfNeeded().then((workspaceData) => {
          const isUpgradeAllowed = workspaceData?.some(work => localStorage.getItem("workspace_id") == work?._id.toString() && work.owner == work.userinfo.userId && work.owner == localStorage.getItem('userId'))

          Swal.fire({
            title: 'Subscription Required',
            text: error?.response?.data?.['message'] || 'Your current plan does not allow this action. Please Upgrade to continue',
            icon: 'warning',
            showCancelButton: isUpgradeAllowed != false,
            confirmButtonText: isUpgradeAllowed ? 'Upgrade Now' : 'OK',
            cancelButtonText: isUpgradeAllowed ? 'Maybe Later' : '',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
          }).then((result) => {
            if (isUpgradeAllowed && result.isConfirmed) {
              window.location.href = `/#/${localStorage.getItem('workspace_id')}/workspace-subscription`
            }
          })

          if (requestUrl?.includes('/uploadfile') || requestUrl?.includes('/aisearch')) {
            return Promise.reject(error)
          }

          dispatch(updateLoaderFlag({ loader: false, text: '' }))
          return new Promise(() => { })
        })
      }



      return Promise.reject(error)
    }
  )
}

// export const initializeTimeMe = (callback) => {
//   TimeMe.initialize({
//     currentPageName: 'DMS',
//     idleTimeoutInSeconds: 1800,
//     trackWhenUserLeavesPage: false,
//     trackWhenUserGoesIdle: true
//   });

// };

// export const callWhenUserLeaves = (callback) => {
//   TimeMe.callWhenUserLeaves(callback);
// };

export const documentIcons = [
  {
    ext: 'ts',
    icon: 'fileCode',
  },
  {
    ext: 'tsx',
    icon: 'fileCode',
  },
  {
    ext: 'zip',
    icon: 'fileZip',
  },
  {
    ext: 'xlsx',
    icon: 'fileSheet'
  },
  {
    ext: 'xls',
    icon: 'fileSheet'
  },
  {
    ext: 'doc',
    icon: 'fileDoc'
  },
  {
    ext: 'docx',
    icon: 'fileDoc'
  },
  {
    ext: 'txt',
    icon: 'fileText'
  },
  {
    ext: 'psd',
    icon: 'fileMedia'
  },
  {
    ext: 'mp4',
    icon: 'fileMovie'
  },
  {
    ext: 'ppt',
    icon: 'filePPT'
  },
  // {
  //     ext: 'html',
  //     icon: 'html5',
  // },
  {
    ext: 'js',
    icon: 'fileJS',
  },
  {
    ext: 'json',
    icon: 'fileCode'
  },
  {
    ext: 'pdf',
    icon: 'filePDF'
  },
  {
    ext: 'pptx',
    icon: 'filePPT'
  },
  {
    ext: 'mp3',
    icon: 'fileMusic'
  },
  {
    ext: 'jpeg',
    icon: 'fileMedia'
  },
  {
    ext: 'jpg',
    icon: 'fileMedia'
  }, {
    ext: 'png',
    icon: 'fileMedia'
  }, {
    ext: 'py',
    icon: 'filePython'
  }, {
    ext: 'java',
    icon: 'fileJava'
  }, {
    ext: 'css',
    icon: 'fileHTML'
  }, {
    ext: 'ts',
    icon: 'fileJS'
  }, {
    ext: 'html',
    icon: 'fileHTML'
  }
]

