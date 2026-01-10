export interface IMessage {
    _id: string
    from: string
    to: string
    text: string
    attachment: string
    createdAt: string
    read: boolean
    error?: string
}

export interface IGroup {
    _id: string
    name: string
    description: string
    members: IUser[]
    image: string    
}

export interface IGroupMessage {
    _id: string
    sender: IUser
    groupId: string
    text: string
    attachment: string | undefined
    readBy?: IUser[],
    createdAt: string
}

export interface IUser {
    _id: number
    name: string
    surname: string
    login: string
    password: string 
    picture: string
}

export interface IOutletContext {
    user: IUser
    setUser: (user: IUser) => void
}