import { useContext, createContext, ReactNode, useState } from "react";
import { ShoppingCart } from "../components/ShoppingCart";
import { useLocalStorage } from "../hooks/useLocalStorage";


// chlidre 속성에 제공하는 유형 
type ShoppingCartProviderProps = {
  children: ReactNode
}

type ShoppingCartContext = {
  openCart: () => void
  closeCart: () => void
  getItemQuantity: (id: number) => number 
  increaseCartQuantity: (id: number) => void
  decreaseCartQuantity: (id: number) => void
  removeFromCart: (id: number) => void
  cartQuantity: number
  cartItems: CartItem[]
}

type CartItem = {
  id: number
  quantity: number 
}

// ShoppingCartContext가 반응에서 가져올 수 있는 createContext 생성
// 기본적으로 비어있는 객체에 전달할 수 있음
const ShoppingCartContext = createContext({} as ShoppingCartContext)

// context를 가져오기 위한 것, useShoppingCart라는 사용자 지정 훅을 내보낼 것이다.
// useContext를 호출하여 반환, 이를 장바구니 context에 전달
export function useShoppingCart() {
  return useContext(ShoppingCartContext)
}

// 내보내기는 실제로 제공자 부분을 구현하기 위한 기능
// ShoppingCartProvider를 호출할 것이고 장바구니 제공자는 일부 하위 항목을 가져오고 해당 하위 항목을 다시 리렌더링 함
export function ShoppingCartProvider({children}: ShoppingCartProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>(
    "shopping-cart", []
  )

  const cartQuantity = cartItems.reduce((quantity, item) => 
    item.quantity + quantity, 0
  )

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

   // 값이 있으면 반환 없으면 0을 반환
  function getItemQuantity(id: number) {
    return cartItems.find((item) => item.id === id)?.quantity || 0
  }

  // 수량 증가
  function increaseCartQuantity(id: number) {
    setCartItems(currItems => {
      if(currItems.find(item => item.id === id) == null) {
        return [...currItems, { id, quantity: 1 }]
      } else {
        return currItems.map(item => {
          if(item.id === id) {
            return { ...item, quantity: item.quantity + 1 }
          } else {
            return item
          }
        })
      }
    })
  }

  // 수량감소
  // id가 현재 id와 같지 않은 항목에 대해 필터링 
  function decreaseCartQuantity(id: number) {
    setCartItems(currItems => {
      if(currItems.find(item => item.id === id)?.quantity === 1) {
        return currItems.filter(item => item.id !== id)
      } else {
        return currItems.map(item => {
          if(item.id === id) {
            return { ...item, quantity: item.quantity - 1 }
          } else {
            return item
          }
        })
      }
    })
  }

  // 장바구니에서 삭제
  function removeFromCart(id: number) {
    setCartItems(currItems => {
      return currItems.filter(item => item.id !== id)

    }) 
  }
  
  return (
    <ShoppingCartContext.Provider value={{ getItemQuantity ,increaseCartQuantity, decreaseCartQuantity, removeFromCart, openCart, closeCart, cartQuantity, cartItems }}>
      {children}
      <ShoppingCart isOpen={isOpen} />
    </ShoppingCartContext.Provider>
   )
}