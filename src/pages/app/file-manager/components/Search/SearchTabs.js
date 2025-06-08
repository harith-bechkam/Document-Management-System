import classnames from "classnames";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Nav, NavItem, NavLink } from "reactstrap";

const SearchTabs = ({ activeTab, setActivetab, searchResult,searchapicall }) => {

    const store = useSelector((state) => state.folders)


    // const alltypes = {
    //     Word: ["doc", "docx", "odt"],
    //     PDF: ["pdf"],
    //     Excel: ["xls", "xlsx", "csv", "ods"],
    //     PPT: ["pptx", "ppt", "ppsx", "pps", "potx", "pot", "pptm", "ppsm", "potm", "odp", "thmx", "xml"],
    //     Images: ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "tif", "webp", "svg", "ico", "heic", "heif", "avif", "raw", "nef", "cr2", "orf", "sr2", "psd", "ai", "eps", "jfif"],
    //     Videos: ["mp4", "mkv", "avi", "mov", "wmv", "flv", "webm", "mpeg", "mpg", "3gp", "ogv", "m4v", "ts", "vob"],
    // };

    // const knowntype = new Set(Object.values(alltypes).flat())

    const navtoggle = (item) => {
        setActivetab(item)
        // searchapicall()
        // console.log(store?.searchfilters,"searchfilters")

        // if (item == "All") {
        //     setshowdata(searchResult)
        // }
        // else if (alltypes[item]) {
        //     setshowdata(searchResult.filter(file => alltypes[item].includes(file._source?.fileType)))
        // }
        // else if (item == "Others") {
        //     setshowdata(searchResult.filter(file => !knowntype.has(file._source?.fileType)))
        // }
        // else {
        //     setshowdata(searchResult)
        // }
    }



    return (
        <>
            <Nav tabs>
                <NavItem className="px-2">
                    <NavLink
                        tag="a"
                        href="#tab"
                        className={classnames({ active: activeTab == "All" })}
                        onClick={(ev) => {
                            ev.preventDefault();
                            navtoggle("All");
                        }}
                    >
                        All
                    </NavLink>
                </NavItem>
                <NavItem className="px-2">
                    <NavLink
                        tag="a"
                        href="#tab"
                        className={classnames({ active: activeTab == "Word" })}
                        onClick={(ev) => {
                            ev.preventDefault();
                            navtoggle("Word");
                        }}
                    >
                        Word
                    </NavLink>
                </NavItem>

                <NavItem className="px-2">
                    <NavLink
                        tag="a"
                        href="#tab"
                        className={classnames({ active: activeTab == "PDF" })}
                        onClick={(ev) => {
                            ev.preventDefault();
                            navtoggle("PDF");
                        }}
                    >
                        PDF
                    </NavLink>
                </NavItem>
                <NavItem className="px-2">
                    <NavLink
                        tag="a"
                        href="#tab"
                        className={classnames({ active: activeTab == "Excel" })}
                        onClick={(ev) => {
                            ev.preventDefault();
                            navtoggle("Excel");
                        }}
                    >
                        Excel
                    </NavLink>
                </NavItem>
                <NavItem className="px-2">
                    <NavLink
                        tag="a"
                        href="#tab"
                        className={classnames({ active: activeTab == "PPT" })}
                        onClick={(ev) => {
                            ev.preventDefault();
                            navtoggle("PPT");
                        }}
                    >
                        PPT
                    </NavLink>
                </NavItem>

                <NavItem className="px-2">
                    <NavLink
                        tag="a"
                        href="#tab"
                        className={classnames({ active: activeTab == "Images" })}
                        onClick={(ev) => {
                            ev.preventDefault();
                            navtoggle("Images");
                        }}
                    >
                        Images
                    </NavLink>
                </NavItem>
                <NavItem className="px-2">
                    <NavLink
                        tag="a"
                        href="#tab"
                        className={classnames({ active: activeTab == "Videos" })}
                        onClick={(ev) => {
                            ev.preventDefault();
                            navtoggle("Videos");
                        }}
                    >
                        Videos
                    </NavLink>
                </NavItem>
                <NavItem className="px-2">
                    <NavLink
                        tag="a"
                        href="#tab"
                        className={classnames({ active: activeTab == "Others" })}
                        onClick={(ev) => {
                            ev.preventDefault();
                            navtoggle("Others");
                        }}
                    >
                        Others
                    </NavLink>
                </NavItem>


            </Nav>

        </>
    )
}

export default SearchTabs