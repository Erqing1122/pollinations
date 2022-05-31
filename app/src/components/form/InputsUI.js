import { 
  FormControlLabel, 
  MenuItem, 
  Radio, 
  RadioGroup, 
  TextField,
  Button, Box, Link } from "@material-ui/core"
import HelpModal from "../HelpModal";
import DropZone from "./customInputs/file";

export const InputField = (props) => {

  if (!props)
    return null

  // Dropzone file input
  if (`${props.id}`.includes('file'))
      return <DropZone {...props} />

  // Radio buttons Yes/No
  if (props.type === 'boolean') 
    return <div style={props.style}>
    <label> {props.title} </label>
    <RadioGroup  value={props.value} onChange={e => props.setFieldValue(props.id, e.target.value === 'true' ? true : false)}>
      <FormControlLabel
        label='Yes'
        value={true}
        control={<Radio  />}
        disabled={props.disabled}/>
      <FormControlLabel
        label='No'
        value={false}
        control={<Radio  />}
        disabled={props.disabled}/>      
    </RadioGroup> 
  </div>
  
  // Select Component
  if (props.enum?.length > 0) 
  return <TextField select {...props}
  onChange={e => props.setFieldValue(props.id, e.target.value)}>
  {
      props.enum.map(option => <MenuItem key={option} value={option}>
          {option}
      </MenuItem>)
  }
  </TextField>    

  // Text/Rest...
  return <TextField fullWidth {...props}/>
}



export const FormActions = ({ isDisabled, formik, colabLink }) => {

  return <>
  <Box 
    display="flex" 
    justifyContent="center" >

    <Button type="submit" disabled={isDisabled || formik.isSubmitting} variant='outlined'>
        <p style={{fontSize: '1.1em', margin: 0}}>
          {formik.isSubmitting ? "Creating..." : "Create"}
        </p>
    </Button>


    
  </Box>
      
  </>
}