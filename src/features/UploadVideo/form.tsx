"use client";

import React from "react";

import { faker } from "@faker-js/faker";
import { yupResolver } from "@hookform/resolvers/yup";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CopyAllOutlined from "@mui/icons-material/CopyAllOutlined";
import KeyboardTabOutlinedIcon from "@mui/icons-material/KeyboardTabOutlined";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Controller, FieldValues, useForm } from "react-hook-form";
import * as yup from "yup";

import Button from "@/components/Button";

import { ImportContainer, InputContainer, StyledCard, ThumbnailUploaderButtons } from "./styled";

const schema = yup
  .object({
    title: yup.string().required(),
    presenter: yup.string().required(),
    event_date: yup.date().required(),
    description: yup.string().required(),
    related_videos: yup.array().required(),
    playlists: yup.array().required(),
  })
  .required();

const VideoForm = () => {
  const {
    control,
    handleSubmit,
    // eslint-disable-next-line no-restricted-syntax
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      presenter: "",
      event_date: undefined,
      description: "",
      related_videos: [],
      playlists: [],
    },
  });

  // eslint-disable-next-line no-restricted-syntax
  const formValues = watch();

  const onSubmit = (data: FieldValues) => {
    return data;
  };

  return (
    <StyledCard>
      <CardHeader title={formValues.title ? formValues.title : "Upload Video"} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <ImportContainer>
            <Autocomplete
              options={[
                { title: "The Shawshank Redemption", year: 1994 },
                { title: "The Godfather", year: 1972 },
              ]}
              disableCloseOnSelect
              getOptionLabel={(option) => option.title}
              renderInput={(params) => <TextField {...params} placeholder="Import session details from  workstream" />}
              size="medium"
              fullWidth
            />
            <Button variant="contained" startIcon={<KeyboardTabOutlinedIcon />}>
              Import
            </Button>
          </ImportContainer>
          <Grid container spacing={2}>
            <Grid size={7}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <InputContainer>
                    <InputLabel>Title</InputLabel>
                    <TextField {...field} variant="outlined" fullWidth />
                    <Typography color="error">{errors?.title?.message}</Typography>
                  </InputContainer>
                )}
              />
              <Controller
                name="presenter"
                control={control}
                render={({ field }) => (
                  <InputContainer>
                    <InputLabel>Presenter</InputLabel>
                    <TextField {...field} variant="outlined" fullWidth />
                    <Typography color="error">{errors?.presenter?.message}</Typography>
                  </InputContainer>
                )}
              />
              <Controller
                name="event_date"
                control={control}
                render={({ field }) => (
                  <InputContainer>
                    <InputLabel>Event Date</InputLabel>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker value={field.value} onChange={field.onChange} />
                    </LocalizationProvider>
                    <Typography color="error">{errors?.event_date?.message}</Typography>
                  </InputContainer>
                )}
              />
              <Controller
                name="related_videos"
                control={control}
                render={() => (
                  <InputContainer>
                    <InputLabel>Related Videos</InputLabel>
                    <Autocomplete
                      multiple
                      id="checkboxes-tags-demo"
                      options={[
                        { title: "The Shawshank Redemption", year: 1994 },
                        { title: "The Godfather", year: 1972 },
                      ]}
                      disableCloseOnSelect
                      getOptionLabel={(option) => option.title}
                      renderOption={(props, option, { selected }) => {
                        const { key, ...optionProps } = props;
                        return (
                          <li key={key} {...optionProps}>
                            <Checkbox
                              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                              checkedIcon={<CheckBoxIcon fontSize="small" />}
                              checked={selected}
                            />
                            {option.title}
                          </li>
                        );
                      }}
                      fullWidth
                      renderInput={(params) => <TextField {...params} placeholder="Choose related videos" />}
                    />
                    <Typography color="error">{errors?.related_videos?.message}</Typography>
                  </InputContainer>
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <InputContainer>
                    <InputLabel>Description</InputLabel>
                    <TextField multiline rows={4} {...field} fullWidth />
                    <Typography color="error">{errors?.description?.message}</Typography>
                  </InputContainer>
                )}
              />
              <InputContainer>
                <InputLabel>Thumbnail</InputLabel>
                <Typography variant="bodySmall">Set a thumbnail that stands out and draws viewers attention.</Typography>
                <ThumbnailUploaderButtons>
                  <Button variant="outlined" startIcon={<AddPhotoAlternateOutlinedIcon />}>
                    File upload
                  </Button>
                  <Button variant="outlined" startIcon={<AutoAwesomeOutlinedIcon />}>
                    auto-generated
                  </Button>
                </ThumbnailUploaderButtons>
              </InputContainer>

              <Controller
                name="playlists"
                control={control}
                render={() => (
                  <InputContainer>
                    <InputLabel>Playlists</InputLabel>
                    <Autocomplete
                      multiple
                      id="checkboxes-tags-demo"
                      options={[
                        { title: "The Shawshank Redemption", year: 1994 },
                        { title: "The Godfather", year: 1972 },
                      ]}
                      disableCloseOnSelect
                      getOptionLabel={(option) => option.title}
                      renderOption={(props, option, { selected }) => {
                        const { key, ...optionProps } = props;
                        return (
                          <li key={key} {...optionProps}>
                            <Checkbox
                              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                              checkedIcon={<CheckBoxIcon fontSize="small" />}
                              checked={selected}
                            />
                            {option.title}
                          </li>
                        );
                      }}
                      fullWidth
                      renderInput={(params) => <TextField {...params} placeholder="Select your related video" />}
                    />
                    <Typography color="error">{errors?.playlists?.message}</Typography>
                  </InputContainer>
                )}
              />
            </Grid>
            <Grid size={5}>
              <Card sx={{ background: "transparent" }}>
                <CardMedia sx={{ height: 140 }} image={faker.image.urlPicsumPhotos()} title="green iguana" />
                <CardContent sx={{ paddingX: 0 }}>
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                    <Box>
                      <Typography gutterBottom variant="h5" component="div">
                        Video Link
                      </Typography>
                      <Typography gutterBottom sx={{ color: "text.secondary" }}>
                        https://arbisoft.com/allhand/W_s.....
                      </Typography>
                    </Box>
                    <IconButton aria-label="settings">
                      <CopyAllOutlined />
                    </IconButton>
                  </Box>
                  <Typography gutterBottom variant="h5" component="div">
                    Original File Name
                  </Typography>
                  <Typography sx={{ color: "text.secondary" }}>podsessionepisode1.mp4</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Typography color="textSecondary" variant="bodyLarge">
              Uploading 80% ... 4 mins left
            </Typography>
            <Button type="submit" variant="contained">
              Publish
            </Button>
          </Box>
        </CardActions>
      </form>
    </StyledCard>
  );
};

export default VideoForm;
