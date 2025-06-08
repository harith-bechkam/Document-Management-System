import { element } from "prop-types"
import { useState, useRef, useEffect } from "react"

const useCustomContextMenu = () => {
    const [isVisible, setIsVisible] = useState(false)

    const [position, setPosition] = useState({ x: 0, y: 0 })

    const [menuOp, setMenuOp] = useState('')
    const [menuItem, setMenuItem] = useState(null)

    const menuRef = useRef(null)

    useEffect(() => {

        if (isVisible) {
            document.addEventListener("click", handleClickOutside)
        }

        return () => {
            document.removeEventListener("click", handleClickOutside)
        }
    }, [isVisible])


    const removeNodesByIds = async (idsToRemove) => {

        idsToRemove.forEach(id => {

            const elements = document.querySelectorAll(`[id="${id}"]`)
            if (elements?.length != 0) {
                elements?.forEach(element => {
                    element.style.visibility = 'hidden'
                })
            }
        })

    }


    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsVisible(false)
        }
    }

    const showContextMenu = async (event, menudata, menu) => {
        event.preventDefault()

        const { clientX, clientY } = event

        setIsVisible(false)

        setTimeout(() => {
            setPosition({ x: clientX, y: clientY })

            setMenuOp(menu)
            setMenuItem(menudata)
            setIsVisible(true)


            const idsToRemove = ["globalMenu", "documents", "starredMenu", "sharedMenu", "recoveryMenu", "sectionMenu", "multiselectdocuments", "multiSelectSharedMenu", "multiSelectStarredMenu", "multiSelectRecoveryMenu"]
            // var removeNodes = idsToRemove.filter(item => item != menu)
            removeNodesByIds(idsToRemove)
        }, 0)

    }


    return { isVisible, position, menuItem, menuOp, showContextMenu, setIsVisible, menuRef }
}

export default useCustomContextMenu
