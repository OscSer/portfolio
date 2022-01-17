import { useEffect, useState } from "react"
import { Form } from "react-bootstrap"
import ReactDatePicker from "react-datepicker"

type Props = {
    selected: Date
    onChange: (date: Date) => void
}

function DatePicker({ onChange, selected }: Props): JSX.Element {
    const [date, setDate] = useState(selected)

    useEffect(() => {
        setDate(selected)
    }, [selected])

    const handleChange = (date: Date) => {
        onChange(date)
        setDate(date)
    }

    return (
        <>
            <Form.Label>Date</Form.Label>
            <ReactDatePicker
                className="form-control"
                dateFormat="MM/dd/yyyy, h:mm aa"
                showTimeSelect
                selected={date}
                onChange={handleChange}
            />
        </>
    )
}

export { DatePicker }
