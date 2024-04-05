import { useState, useMemo, useEffect } from "react";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useLocales } from "src/locales";
import { Link as RouterLink } from "react-router-dom";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// data
import { getMemberships, subjects_dk, subjects_es, interests_dk } from "../../assets/data";
import emojiPhone from "../../assets/thinkingphone.png";
import trustpilot5stars from "../../assets/trustpilot5stars.png";
import { phoneNumberValidation } from "../../utils/phoneValidation";
import { MuiTelInputInfo } from "mui-tel-input";
// Mixpanel
import { Mixpanel } from "src/auth/Mixpanel";
// @mui
import { Stack, Box, Link, CircularProgress, Step, Grid, Divider, Alert, Typography, Slide, Button, TextField, MobileStepper, Card, Fab, MenuItem, Select, OutlinedInput, FormControl, InputLabel } from "@mui/material";
import { LoadingButton } from "@mui/lab";
// auth
import { useAuthContext } from "../../auth/useAuthContext";
import RoleBasedGuard from "src/auth/RoleBasedGuard";

// components
import Iconify from "../../components/iconify";
import FormProvider, { RHFTextField, RHFTel } from "../../components/hook-form";
import Logo from "../../components/logo";
import TrustpilotWidget from "./TrustpilotWidget";
//utils
import reCAPTCHA from "src/utils/recaptcha";
import { useTheme, alpha } from "@mui/material/styles";
import { useDispatch, useSelector } from "../../redux/store";
import { getCustomerUnprotected } from "src/redux/slices/customer";
import LanguagePopover from "src/layouts/dashboard/header/LanguagePopover";

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  afterSubmit?: string;
  market: string;
};

export default function AuthRegisterForm({ email, phone, firstName, lastName, market }: FormValuesProps) {
  const { register } = useAuthContext();
  const { translate } = useLocales();
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const { customer, isLoading } = useSelector((state) => state.customer);
  const dispatch = useDispatch();
  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required(`${translate("register.createAccount.errorFirst")}`),
    lastName: Yup.string().required(`${translate("register.createAccount.errorLast")}`),
    email: Yup.string()
      .required(`${translate("register.createAccount.errorEmail")}`)
      .email(`${translate("register.createAccount.errorCorrectEmail")}`),
  });

  const defaultValues = {
    firstName: firstName || "",
    lastName: lastName || "",
    email: email || "",
    phone: phone || "",
    market: market,
  };
  const navigate = useNavigate();
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [school, setSchool] = useState("");
  const [highschooltype, setHighschoolType] = useState("");
  const [grade, setGrade] = useState("");
  const [level, setLevel] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const memberships = useMemo(() => getMemberships(theme, translate), [theme, translate]);
  const [customerId, setCustomerId] = useState("");
  console.log(selectedInterests);
  // Toggle selection of an interest
  const toggleInterestSelection = (interestLabel: string) => {
    if (selectedInterests.includes(interestLabel)) {
      setSelectedInterests(selectedInterests.filter((label) => label !== interestLabel));
    } else {
      setSelectedInterests([...selectedInterests, interestLabel]);
    }
  };
  // Toggle selection of an interest
  const toggleSubjectSelection = (subjectLabel: string) => {
    if (selectedSubjects.includes(subjectLabel)) {
      setSelectedSubjects(selectedSubjects.filter((label) => label !== subjectLabel));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectLabel]);
    }
  };
  const [goals, setGoals] = useState("");
  // State for search text
  const [searchText, setSearchText] = useState("");
  const [searchTextSubject, setSearchTextSubject] = useState("");
  // Filtered interests based on search text
  const filteredInterests = interests_dk.filter((interest) => interest.label.toLowerCase().includes(searchText.toLowerCase()));
  const subjects = subjects_dk.filter((subject) => subject.label.toLowerCase().includes(searchTextSubject.toLowerCase()));
  const {
    reset,
    setError,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;
  const handleChange = (newPhone: string, info: MuiTelInputInfo) => {
    setValue("phone", info.numberValue || "", { shouldValidate: true });
  };
  const values = watch();
  useEffect(() => {
    // Function to handle tab/browser close
    const handleTabClose = (event: BeforeUnloadEvent) => {
      // Mixpanel tracking
      Mixpanel.track("Registration Page Close", {
        email: values.email || "",
        firstName: values.firstName || "",
        lastName: values.lastName || "",
        phone: values.phone || "",
        school: school,
        selectedSubject: selectedSubjects,
        level: level,
        goals: goals,
        selectedInterests: selectedInterests,
      });
      console.log("Close tab");
      // Prevents the default 'Are you sure you want to leave?' dialog (optional)
      event.preventDefault();
    };
    console.log("Close tab");

    // Attach event listener
    window.addEventListener("beforeunload", handleTabClose);

    // Cleanup function
    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, []);

  const steps = [
    {
      label: `${translate("register.school.whatTypeOfSchool")}`,
      obligatory: false,
      marketingText: (
        <div style={{ marginRight: "5%" }}>
          “Alle aftaler overholdt til punkt og prikke. Bedste anbefalinger herfra.” <img src="https://source.unsplash.com/featured/70x70" alt="placeholder" style={{ borderRadius: "35px" }} />
          <Grid container>
            <Grid item xs={12} sx={{ mt: "-18%", ml: "20%" }}>
              <p style={{ fontSize: "18px", fontWeight: "bold" }}>-Hans Hansen via TrustPilot</p>
            </Grid>
            <Grid item xs={12} sx={{ mt: "-8%", ml: "20%" }}>
              <img src={trustpilot5stars} alt="" />
            </Grid>
          </Grid>
        </div>
      ),
      field: (
        <div style={{ margin: "auto", maxWidth: "750px", marginTop: "10%" }}>
          <Grid container sx={{ textAlign: "center" }}>
            <Grid
              item
              xs={12}
              lg={6}
              sx={{
                "@media (max-width: 600px)": {
                  marginBottom: "20px",
                  margin: "auto",
                  textAlign: "center",
                },
              }}
            >
              <Button
                sx={{
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                }}
                onClick={() => {
                  setActiveStep(activeStep + 1);
                  setSchool("highschool");
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#EDE7E2",
                    border: "1px 1px 1px 1px",
                    borderRadius: "16px",
                    color: "black",
                    boxShadow: "0px 4px 0px 0px #C8C3BF",
                    maxHeight: "30%",
                    width: "328px",
                    height: "231px",
                    "&:hover": {
                      backgroundColor: "#D6FFCC",
                      boxShadow: "0px 4px 0px 0px #329473",
                    },
                    "@media (max-width: 600px)": {
                      height: "auto",
                      width: "300px",
                      maxHeight: "unset",
                    },
                  }}
                >
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "60px",
                      background: "rgba(218, 213, 209, 0.65)",
                      justifySelf: "center",
                      textAlign: "center",
                      margin: "auto",
                      marginTop: "5%",
                    }}
                  >
                    <Typography sx={{ fontSize: "96px", marginTop: "0", marginBottom: "0" }}>🎓</Typography>
                  </div>
                  <Typography sx={{ fontSize: "36px", color: "#000000", marginTop: "5%" }}>{`${translate("register.school.highschool")}`}</Typography>
                </Box>
              </Button>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Button
                sx={{
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                }}
                onClick={() => {
                  setActiveStep(activeStep + 1);
                  setSchool("middleschool");
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#EDE7E2",
                    border: "1px 1px 1px 1px",
                    borderRadius: "16px",
                    color: "black",
                    boxShadow: "0px 4px 0px 0px #C8C3BF",
                    maxHeight: "30%",
                    width: "328px",
                    height: "231px",
                    "&:hover": {
                      backgroundColor: "#D6FFCC",
                      boxShadow: "0px 4px 0px 0px #329473",
                    },
                    "@media (max-width: 600px)": {
                      height: "auto",
                      width: "300px",
                      maxHeight: "unset",
                    },
                  }}
                >
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "60px",
                      background: "rgba(218, 213, 209, 0.65)",
                      justifySelf: "center",
                      textAlign: "center",
                      margin: "auto",
                      marginTop: "5%",
                    }}
                  >
                    <Typography sx={{ fontSize: "96px", marginTop: "0", marginBottom: "0" }}>🎒</Typography>
                  </div>
                  <Typography sx={{ fontSize: "36px", color: "#000000", marginTop: "5%" }}>{`${translate("register.school.middleschool")}`}</Typography>
                </Box>
              </Button>
            </Grid>
          </Grid>
        </div>
      ),
    },
    {
      label: `${translate("register.grade.whatGrade")}`,
      obligatory: false,
      marketingText: <div>Here is social proofing</div>,
      field: (
        <>
          {school === "highschool" ? (
            <>
              {
                <div style={{ textAlign: "center" }}>
                  <Typography
                    sx={{
                      fontSize: "148px",
                      mt: "5%",
                    }}
                  >
                    🤔
                  </Typography>

                  <Box
                    sx={{
                      maxWidth: "400px",
                      margin: "auto",
                      ta: "left",
                      pt: "2%",
                      "@media (max-width: 600px)": {
                        margin: "5%",
                      },
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label" sx={{ ta: "left" }}>
                        {`${translate("register.grade.chooseType")}`}
                      </InputLabel>
                      <Select
                        sx={{ ta: "left" }}
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        label="Choose type of highschool"
                        value={highschooltype}
                        onChange={(e) => {
                          setHighschoolType((e.target as HTMLInputElement).value);
                        }}
                      >
                        <MenuItem value="1">STX</MenuItem>
                        <MenuItem value="2">HTX</MenuItem>
                        <MenuItem value="3">HHX</MenuItem>
                        <MenuItem value="4">HX</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box
                    sx={{
                      maxWidth: "400px",
                      margin: "auto",
                      ta: "left",
                      pt: "2%",
                      "@media (max-width: 600px)": {
                        margin: "5%",
                      },
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label"> {`${translate("register.grade.chooseGrade")}`}</InputLabel>
                      <Select
                        sx={{ ta: "left" }}
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        label="Choose grade"
                        value={grade}
                        onChange={(e) => {
                          setGrade((e.target as HTMLInputElement).value);
                        }}
                      >
                        <MenuItem value="1">1.G</MenuItem>
                        <MenuItem value="2">2.G</MenuItem>
                        <MenuItem value="3">3.G</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </div>
              }
            </>
          ) : (
            <>
              {
                <div style={{ textAlign: "center" }}>
                  <Typography sx={{ fontSize: "148px", mt: "5%" }}>🤔</Typography>
                  <Box
                    sx={{
                      maxWidth: "400px",
                      margin: "auto",
                      ta: "left",
                      "@media (max-width: 600px)": {
                        margin: "5%",
                      },
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">{`${translate("register.grade.chooseGrade")}`}</InputLabel>
                      <Select
                        sx={{ ta: "left" }}
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        label="Choose grade"
                        value={grade}
                        onChange={(e) => {
                          setGrade((e.target as HTMLInputElement).value);
                        }}
                      >
                        <MenuItem value="1">0. klasse</MenuItem>
                        <MenuItem value="2">1. klasse</MenuItem>
                        <MenuItem value="3">2. klasse</MenuItem>
                        <MenuItem value="4">3. klasse</MenuItem>
                        <MenuItem value="5">4. klasse</MenuItem>
                        <MenuItem value="6">5. klasse</MenuItem>
                        <MenuItem value="7">6. klasse</MenuItem>
                        <MenuItem value="8">7. klasse</MenuItem>
                        <MenuItem value="9">8. klasse</MenuItem>
                        <MenuItem value="10">9. klasse</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </div>
              }
            </>
          )}
        </>
      ),
    },

    {
      label: `${translate("register.subjects.whatSubjects")}`,
      obligatory: false,
      marketingText: <div>Et andet eksempel på text under social proof.</div>,
      field: (
        <div style={{ marginTop: "1%", maxWidth: "700px", margin: "auto", paddingLeft: "0" }}>
          <TextField
            fullWidth
            label={`${translate("register.subjects.search")}`}
            variant="outlined"
            sx={{
              marginBottom: 2,
              width: "98%",
              paddingLeft: "8px",
              "@media (max-width: 600px)": {
                width: "425px",
              },
              "@media (max-width: 400px)": {
                width: "370px",
              },
            }} // Adjust spacing as needed
            // Add onChange handler if needed for search functionality
            onChange={(e) => {
              // Your search logic here
              setSearchTextSubject(e.target.value);
            }}
          />
          <Grid container spacing={1}>
            {subjects.map((subject, key) => {
              const isSelected = selectedSubjects.includes(subject.label);

              return (
                <Grid key={key} item xs={6} lg={4}>
                  <Button
                    sx={{
                      backgroundColor: "transparent",
                      "&:hover": {
                        backgroundColor: "transparent",
                      },
                    }}
                    onClick={() => {
                      toggleSubjectSelection(subject.label);
                    }}
                  >
                    <Box
                      sx={{
                        width: "14vw",
                        height: "13vh",
                        border: "1px 1px 1px 1px",
                        borderRadius: "16px",
                        color: "black",
                        boxShadow: isSelected ? "0px 4px 0px 0px #329473" : "0px 4px 0px 0px #C8C3BF",
                        backgroundColor: isSelected ? "lightgreen" : "#EDE7E2",
                        "&:hover": {
                          backgroundColor: "#D6FFCC",
                          boxShadow: "0px 4px 0px 0px #329473",
                        },
                        "@media (max-width: 600px)": {
                          height: "auto", // Auto height on mobile
                          width: "200px", // Limit maximum width
                        },
                        "@media (max-width: 400px)": {
                          height: "auto",
                          width: "175px",
                        },
                      }}
                    >
                      <Grid container>
                        <Grid
                          item
                          xs={3}
                          sx={{
                            marginTop: "13%",
                            "@media (max-width: 600px)": {
                              marginTop: "3%",
                            },
                          }}
                        >
                          <div
                            style={{
                              width: "55px",
                              height: "55px",
                              borderRadius: "28px",
                              background: "rgba(218, 213, 209, 0.65)",
                              marginLeft: "20%",

                              justifySelf: "center",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "36px",
                                paddingTop: "5%",
                              }}
                            >
                              {subject.icon}
                            </Typography>
                          </div>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography
                            sx={{
                              color: "#000000",
                              marginTop: "25%",
                              marginLeft: "15%",
                              fontSize: "20px",
                              textAlign: "left",
                              "@media (max-width: 600px)": {
                                marginTop: "10%",
                              },
                              "@media (max-width: 400px)": {
                                fontSize: "18px",
                                marginTop: "14%",
                              },
                            }}
                          >
                            {`${translate(subject.label)}`}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </div>
      ),
    },
    {
      label: `${translate("register.level.whatIsYourCurrentLevel")}`,
      obligatory: false,
      field: (
        <div style={{ margin: "auto" }}>
          {/* <Typography
            sx={{
              margin: 'auto',
              fontStyle: 'italic',
              textAlign: 'center',
              opacity: '60%',
              marginTop: '2%',
              fontSize: '16px',
            }}
          >
            Test Lorem, ipsum dolor sit amet consectetur adipisicing elit. Asperiores, eveniet!
          </Typography> 
          If we add some text under the main title. It could look something like this.
          */}
          <Grid
            container
            sx={{
              textAlign: "center",
              marginTop: "10%",
              "@media (max-width: 600px)": {
                marginTop: "2%",
                height: "auto", // Auto height on mobile
                textAlign: "center", // Center align the content on mobile
              },
            }}
          >
            <Grid item lg={4} md={4} xs={12}>
              <Button
                onClick={() => {
                  setActiveStep(activeStep + 1);
                  setLevel("low");
                }}
              >
                <Box
                  sx={{
                    width: "200px",
                    height: "100%",
                    "@media (max-width: 600px)": {
                      // Apply styles for screens with a maximum width of 600px (mobile)
                      width: "100%", // Full width on mobile
                      height: "auto", // Auto height on mobile
                      textAlign: "center", // Center align the content on mobile
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "148px",
                      "@media (max-width: 400px)": {
                        fontSize: "100px",
                      },
                    }}
                  >
                    😢
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "36px",
                      color: "#000000",
                      marginTop: "-25%",
                      "@media (max-width: 400px)": {
                        fontSize: "26px",
                        marginTop: "-16%",
                      },
                    }}
                  >
                    {`${translate("register.level.notoptimal")}`}
                  </Typography>
                </Box>
              </Button>
            </Grid>
            <Grid item lg={4} md={4} xs={12}>
              <Button
                onClick={() => {
                  setActiveStep(activeStep + 1);
                  setLevel("OK");
                }}
              >
                <Box sx={{ width: "200px", height: "100%" }}>
                  <Typography
                    sx={{
                      fontSize: "148px",
                      "@media (max-width: 400px)": {
                        fontSize: "100px",
                      },
                    }}
                  >
                    ☺️
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "36px",
                      color: "#000000",
                      marginTop: "-25%",
                      "@media (max-width: 400px)": {
                        fontSize: "26px",
                        marginTop: "-16%",
                      },
                    }}
                  >
                    {`${translate("register.level.good")}`}
                  </Typography>
                </Box>
              </Button>
            </Grid>

            <Grid item lg={4} md={4} xs={12}>
              <Button
                onClick={() => {
                  setActiveStep(activeStep + 1);
                  setLevel("Good");
                }}
              >
                <Box sx={{ width: "200px", height: "100%" }}>
                  <Typography
                    sx={{
                      fontSize: "148px",
                      "@media (max-width: 400px)": {
                        fontSize: "100px",
                      },
                    }}
                  >
                    😎
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "32px",
                      color: "#000000",
                      marginTop: "-25%",
                      "@media (max-width: 400px)": {
                        fontSize: "26px",
                        marginTop: "-16%",
                      },
                    }}
                  >
                    {`${translate("register.level.perfect")}`}
                  </Typography>
                </Box>
              </Button>
            </Grid>
          </Grid>
        </div>
      ),
    },
    {
      label: `${translate("register.goals.whatAreYourNeeds")}`,
      obligatory: false,
      marketingText: <div>Her er endnu et eksempel på ny text i social proof section.</div>,
      field: (
        <div
          style={{
            margin: "auto",
            marginTop: "5%",
            textAlign: "center",
          }}
        >
          <Grid container>
            <Grid
              item
              xs={12}
              sx={{
                marginBottom: "2%",
                "@media (max-width: 600px)": {
                  marginBottom: "30px",
                },
              }}
            >
              <Button
                sx={{
                  width: "75%",
                  height: "100%",
                  backgroundColor: "#EDE7E2",
                  border: "1px 1px 1px 1px",
                  borderRadius: "16px",
                  color: "black",
                  boxShadow: "0px 4px 0px 0px #C8C3BF",
                  "&:hover": {
                    backgroundColor: "#D6FFCC",
                    boxShadow: "0px 4px 0px 0px #329473",
                  },
                }}
                onClick={() => {
                  setActiveStep(activeStep + 1);
                  setGoals("Needs to catch-up");
                }}
              >
                <Box sx={{ width: "100%", height: "100%" }}>
                  <Stack direction={"row"}>
                    <div
                      style={{
                        width: "55px",
                        height: "55px",
                        borderRadius: "60px",
                        background: "rgba(218, 213, 209, 0.65)",
                        justifySelf: "center",
                        textAlign: "center",
                        margin: "3%",
                      }}
                    >
                      <Typography sx={{ fontSize: "36px", marginTop: "8%" }}>⏱</Typography>
                    </div>
                    <Typography
                      sx={{
                        fontSize: "32px",
                        color: "#000000",
                        marginTop: "4%",
                        "@media (max-width: 600px)": {
                          fontSize: "26px",
                        },
                        "@media (max-width: 400px)": {
                          fontSize: "22px",
                          marginTop: "7%",
                        },
                      }}
                    >
                      {`${translate("register.goals.needsToCatch")}`}
                    </Typography>
                  </Stack>
                </Box>
              </Button>
            </Grid>

            <Grid
              item
              xs={12}
              sx={{
                marginBottom: "2%",
                "@media (max-width: 600px)": {
                  marginBottom: "30px",
                },
              }}
            >
              <Button
                sx={{
                  width: "75%",
                  height: "100%",
                  backgroundColor: "#EDE7E2",
                  border: "1px 1px 1px 1px",
                  borderRadius: "16px",
                  color: "black",
                  boxShadow: "0px 4px 0px 0px #C8C3BF",
                  "&:hover": {
                    backgroundColor: "#D6FFCC",
                    boxShadow: "0px 4px 0px 0px #329473",
                  },
                }}
                onClick={() => {
                  setActiveStep(activeStep + 1);
                  setGoals("Better grades");
                }}
              >
                <Box sx={{ width: "100%", height: "100%" }}>
                  <Stack direction={"row"}>
                    <div
                      style={{
                        width: "55px",
                        height: "55px",
                        borderRadius: "60px",
                        background: "rgba(218, 213, 209, 0.65)",
                        justifySelf: "center",
                        textAlign: "center",
                        margin: "3%",
                      }}
                    >
                      <Typography sx={{ fontSize: "36px", marginTop: "8%" }}>📝</Typography>
                    </div>
                    <Typography
                      sx={{
                        fontSize: "32px",
                        color: "#000000",
                        marginTop: "4%",
                        "@media (max-width: 600px)": {
                          fontSize: "26px",
                        },
                        "@media (max-width: 400px)": {
                          fontSize: "22px",
                          marginTop: "7%",
                        },
                      }}
                    >
                      {`${translate("register.goals.betterGrades")}`}
                    </Typography>
                  </Stack>
                </Box>
              </Button>
            </Grid>

            <Grid
              item
              xs={12}
              sx={{
                marginBottom: "2%",
                "@media (max-width: 600px)": {
                  marginBottom: "30px",
                },
              }}
            >
              <Button
                sx={{
                  width: "75%",
                  height: "100%",
                  backgroundColor: "#EDE7E2",
                  border: "1px 1px 1px 1px",
                  borderRadius: "16px",
                  color: "black",
                  boxShadow: "0px 4px 0px 0px #C8C3BF",
                  "&:hover": {
                    backgroundColor: "#D6FFCC",
                    boxShadow: "0px 4px 0px 0px #329473",
                  },
                }}
                onClick={() => {
                  setActiveStep(activeStep + 1);
                  setGoals("Needs motivation");
                }}
              >
                <Box sx={{ width: "100%", height: "100%" }}>
                  <Stack direction={"row"}>
                    <div
                      style={{
                        width: "55px",
                        height: "55px",
                        borderRadius: "60px",
                        background: "rgba(218, 213, 209, 0.65)",
                        justifySelf: "center",
                        textAlign: "center",
                        margin: "3%",
                      }}
                    >
                      <Typography sx={{ fontSize: "36px", marginTop: "8%" }}>🎯</Typography>
                    </div>
                    <Typography
                      sx={{
                        fontSize: "32px",
                        color: "#000000",
                        marginTop: "4%",
                        "@media (max-width: 600px)": {
                          fontSize: "26px",
                        },
                        "@media (max-width: 400px)": {
                          fontSize: "22px",
                          marginTop: "7%",
                        },
                      }}
                    >
                      {" "}
                      {`${translate("register.goals.needsMotivation")}`}
                    </Typography>
                  </Stack>
                </Box>
              </Button>
            </Grid>
          </Grid>
        </div>
      ),
    },
    {
      label: `${translate("register.interests.whatAreYourSpecificInterests")}`,
      obligatory: false,
      marketingText: <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione, eveniet!</div>,
      field: (
        <div style={{ maxWidth: "700px", margin: "auto" }}>
          {activeStep === 5 ? (
            <div style={{ textAlign: "right" }}>
              <Button
                sx={{
                  color: "#000000",
                  border: "1px solid #000000",
                  marginRight: "4%",
                  marginBottom: "1%",
                  marginTop: "-2%",
                  "@media (max-width: 600px)": {
                    marginTop: "2.5%",
                  },

                  // We could remove margin here, but I think it looks better with margin.
                }}
                onClick={() => {
                  setActiveStep(activeStep + 1);
                }}
                variant="outlined"
                size="small"
              >
                {`${translate("register.interests.skip")}`}
              </Button>
            </div>
          ) : (
            <></>
          )}
          <TextField
            fullWidth
            label={`${translate("register.interests.search")}`}
            variant="outlined"
            sx={{
              marginBottom: 2,
              width: "96%",
              "@media (max-width: 600px)": {
                marginLeft: "11%",
                marginBottom: "2%",
                width: "300px",
              },
            }} // Adjust spacing as needed
            // Add onChange handler if needed for search functionality
            onChange={(e) => {
              // Your search logic here
              setSearchText(e.target.value);
            }}
          />

          <div style={{ height: "60vh", overflow: "auto" }}>
            <Grid
              container
              sx={{
                maxWidth: "700px",
                margin: "auto",
                "@media (max-width: 600px)": {
                  height: "20vh",
                  width: "300px",
                  maxHeight: "unset",
                  margin: "auto",
                },
                "@media (max-width: 400px)": {
                  width: "275px",
                  maxHeight: "unset",
                  margin: "auto",
                },
              }}
            >
              {filteredInterests.map((value, key) => {
                const isSelected = selectedInterests.includes(value.label);
                return (
                  <>
                    <Grid item xs={12} lg={4} md={12}>
                      <Button
                        sx={{
                          width: "14vw",
                          height: "13vh",
                          border: "1px 1px 1px 1px",
                          borderRadius: "16px",
                          color: "black",
                          boxShadow: isSelected ? "0px 4px 0px 0px #329473" : "0px 4px 0px 0px #C8C3BF",
                          backgroundColor: isSelected ? "lightgreen" : "#EDE7E2",
                          "&:hover": {
                            backgroundColor: "#D6FFCC",
                            boxShadow: "0px 4px 0px 0px #329473",
                          },
                          marginBottom: "5%",
                          "@media (max-width: 600px)": {
                            width: "90%",
                            height: "13vh",
                          },
                          "@media (max-width: 1000px)and (min-width: 601px)": {
                            width: "90%",
                            height: "20vh",
                          },
                          "@media (max-width: 400px)": {
                            width: "100%",
                            height: "17vh",
                          },
                          // backgroundColor: isSelected ? 'lightgreen' : 'default', // Change color if selected
                        }}
                        onClick={() => toggleInterestSelection(value.label)}
                      >
                        <Box sx={{ width: "100%", height: "100%" }}>
                          <Stack direction={"row"}>
                            <div
                              style={{
                                width: "55px",
                                height: "55px",
                                borderRadius: "60px",
                                background: "rgba(218, 213, 209, 0.65)",
                                justifySelf: "center",
                                textAlign: "center",
                                marginLeft: "5%",
                                marginTop: "10%",
                              }}
                            >
                              <Typography sx={{ fontSize: "36px", marginTop: "5%" }}> {value.icon} </Typography>
                            </div>
                            <Typography
                              sx={{
                                fontSize: "20px",
                                color: "#000000",
                                marginTop: "17%",
                                marginLeft: "5%",
                                "@media (max-width: 1000px)and (min-width: 601px)": {
                                  marginTop: "4%",
                                  marginLeft: "5%",
                                },
                              }}
                            >
                              {" "}
                              {`${translate(value.label)}`}
                            </Typography>
                          </Stack>
                        </Box>
                      </Button>
                    </Grid>
                  </>
                );
              })}
            </Grid>
          </div>
          {/* This button needs to be with the mobileStepper and appear two times. */}
        </div>
      ),
    },
    {
      label: `${translate("register.createAccount.createYourAccount")}`,
      obligatory: true,
      marketingText: <div>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Velit, laboriosam! </div>,
      field: (
        <div
          style={{
            marginLeft: "5%",
            marginRight: "5%",
            marginTop: "10%",
            width: "90%",
            height: "90%",
          }}
        >
          {/* <Stack sx={{ marginBottom: '1%' }} direction={{ xs: 'column', sm: 'row' }} spacing={2}> */}
          <RHFTextField
            name="firstName"
            label={`${translate("register.createAccount.firstName")}`}
            sx={{
              marginBottom: "2%",
              "@media  (max-width: 600px)": {
                marginBottom: "4%",
              },
            }}
          />
          <RHFTextField
            name="lastName"
            label={`${translate("register.createAccount.lastName")}`}
            sx={{
              marginBottom: "2%",
              "@media (max-width: 600px)": {
                marginBottom: "4%",
              },
            }}
          />
          {/* </Stack> */}
          <Stack
            sx={{
              marginBottom: "1%",
              "@media  (max-width: 600px)": {
                marginBottom: "2%",
              },
            }}
            direction={{ xs: "column" }}
            spacing={2}
          >
            <RHFTel defaultCountry={market === "DK" ? "DK" : "ES"} name={`${translate("register.createAccount.phone")}`} label={String(translate("customer.phoneCustomer"))} onChange={handleChange} />
            <RHFTextField type="email" name="email" label="Email" />
          </Stack>

          {/* Showing all the steps */}
          <LoadingButton
            fullWidth
            color="inherit"
            type="submit"
            size="large"
            variant="contained"
            loading={isSubmitSuccessful || isSubmitting}
            sx={{
              bgcolor: "#F75B2B",
              boxShadow: "0px 8px 0px 0px #EC3E09",
              fontSize: "22px",
              marginTop: "3%",
              borderRadius: "50px",
              color: (theme) => (theme.palette.mode === "light" ? "common.white" : "#F75B2B"),
              "&:hover": {
                bgcolor: "#E95526",
                boxShadow: "0px 8px 0px 0px #CE3507",
                color: (theme) => (theme.palette.mode === "light" ? "common.white" : "grey.800"),
              },
            }}
          >
            <Typography sx={{ marginTop: "6px", fontSize: "24px" }}>{`${translate("register.createAccount.createAccount")}`}</Typography>
          </LoadingButton>
          <Typography component="div" sx={{ color: "text.secondary", mt: 3, typography: "caption", textAlign: "center" }}>
            {`${translate("register.createAccount.bySigningUp")}`}
            <Link underline="always" color="text.primary" href="https://www.toptutors.com/betingelser">
              {`${translate("register.createAccount.termsAndConditions")}`}
            </Link>
            {`${translate("register.createAccount.and")}`}
            <Link underline="always" color="text.primary" href="https://www.toptutors.com/privatlivspolitik">
              {`${translate("register.createAccount.privacyPolicy")}`}
            </Link>
          </Typography>
        </div>
      ),
    },
    {
      label: `${translate("register.continue.howDoYouWantToContinue")}`,
      obligatory: false,
      marketingText: <div>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Numquam.</div>,
      field: (
        <div
          style={{
            margin: "auto",
            marginTop: "5%",
            textAlign: "center",
          }}
        >
          <h2> {`${translate("register.continue.startYourMembership")}`} </h2>
          <Grid container>
            <Grid
              item
              xs={12}
              sx={{
                marginBottom: "2%",
                "@media (max-width: 600px)": {
                  marginBottom: "30px",
                },
              }}
            >
              <Button
                sx={{
                  width: "55%",
                  height: "75%",
                  bgcolor: "#F75B2B",
                  boxShadow: "0px 8px 0px 0px #EC3E09",
                  fontSize: "22px",
                  marginTop: "1%",
                  borderRadius: "50px",
                  color: (theme) => (theme.palette.mode === "light" ? "common.white" : "#F75B2B"),
                  "&:hover": {
                    bgcolor: "#E95526",
                    boxShadow: "0px 8px 0px 0px #CE3507",
                    color: (theme) => (theme.palette.mode === "light" ? "common.white" : "grey.800"),
                  },
                }}
                onClick={() => {
                  navigate(`/membership/order/${customer?.id}`);
                }}
              >
                <Typography
                  sx={{
                    fontSize: "24px",
                    color: "#fffff",
                    marginTop: "2%",
                    "@media (max-width: 600px)": {
                      fontSize: "20px",
                    },
                    "@media (max-width: 400px)": {
                      fontSize: "18px",
                      marginTop: "5%",
                      marginBottom: "2%",
                    },
                  }}
                >
                  {`${translate("register.continue.customize")}`}
                </Typography>
              </Button>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                marginBottom: "2%",
                "@media (max-width: 600px)": {
                  marginBottom: "30px",
                },
              }}
            >
              <h2>{`${translate("register.continue.or")}`}</h2>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                marginBottom: "2%",
                "@media (max-width: 600px)": {
                  marginBottom: "30px",
                },
              }}
            >
              <h2 style={{ marginTop: "-2%", marginBottom: "1%" }}>{`${translate("register.continue.waitUpTo")}`}</h2>
              <Box
                sx={{
                  borderTop: "0.5px solid",
                  borderRight: "0.5px solid",
                  borderLeft: "0.5px solid",
                  width: "75%",
                  height: "100%",
                  backgroundColor: "#f1f2f3",
                  border: "1px 1px 1px 1px",
                  borderRadius: "16px",
                  color: "black",
                  boxShadow: "0px 4px 0px 0px #C8C3BF",
                  margin: "auto",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "28px",
                    color: "#000000",
                    pt: "3%",
                    "@media (max-width: 600px)": {
                      fontSize: "24px",
                    },
                    "@media (max-width: 400px)": {
                      fontSize: "22px",
                      marginTop: "7%",
                    },
                  }}
                >
                  {`${translate("register.continue.getContacted")}`}
                </Typography>
                <Box
                  sx={{
                    fontSize: "16px",
                    color: "#000000",
                    marginTop: "2%",
                    width: "100%",
                    textAlign: "left",
                    ml: "5%",
                    pb: "5%",
                    "@media (max-width: 600px)": {
                      fontSize: "18px",
                    },
                    "@media (max-width: 400px)": {
                      fontSize: "16px",
                      marginTop: "7%",
                    },
                  }}
                >
                  <Grid container>
                    <Grid item lg={8} xs={12}>
                      <Typography
                        sx={{
                          pt: "2%",
                          pr: "10%",
                          "@media (max-width: 600px)": {
                            margin: "auto",
                          },
                        }}
                      >
                        {`${translate("register.continue.copyContacted")}`}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      lg={4}
                      sx={{
                        "@media (max-width: 600px)": {
                          margin: "auto",
                          mt: "5%",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          "@media (max-width: 600px)": {
                            width: "130px",
                            margin: "auto",
                          },
                        }}
                      >
                        <img src={emojiPhone} alt="emoji on the phone" style={{ width: "130px" }} />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </div>
      ),
    },
  ];
  const onSubmit = async (data: FormValuesProps) => {
    // try {
    // const response = await register(
    //   data.email || '',
    //   data.firstName || '',
    //   data.lastName || '',
    //   data.phone || '',
    //   school,
    //   selectedSubjects,
    //   level,
    //   goals,
    //   selectedInterests,
    //   data.market
    // );
    // if (response) {
    //   Mixpanel.track('New Customer Flow', {
    //     email: data.email || '',
    //     firstName: data.firstName || '',
    //     lastName: data.lastName || '',
    //     phone: data.phone || '',
    //     school: school,
    //     selectedSubject: selectedSubjects,
    //     level: level,
    //     goals: goals,
    //     selectedInterests: selectedInterests,
    //   });
    //   dispatch(getCustomerUnprotected(response));
    setActiveStep(activeStep + 1);
    //   } else {
    //     reset();
    //   }
    // } catch (error) {
    //   reset();
    // }
  };
  const handleNext = () => {
    setSearchText("");
    setSearchTextSubject("");
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Grid container>
      <Grid
        item
        lg={4}
        xs={0}
        sx={{
          "@media (max-width: 1199px)": {
            display: "none",
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            backgroundColor: theme.palette.primary.light,
          }}
        >
          <Box
            sx={{
              paddingTop: "40%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {/* Container for the other two images positioned on the right */}
            {/* <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', mr: 5 }}>
              <Box component="img" src="/assets/trustpilot_logo.svg" sx={{ height: 50, mb: 1 }} />
              <Box
                component="img"
                src="/assets/trustpilot_ratings_4halfstar.svg"
                sx={{ height: 50 }}
              />
            </Box> */}
            <Grid container sx={{ margin: "auto", marginLeft: "5%" }}>
              <Grid item lg={12}>
                <Typography
                  sx={{
                    color: "#FFFFFF",
                    fontSize: "32px",
                  }}
                >
                  {steps[activeStep].marketingText}
                </Typography>
              </Grid>
              <Grid item lg={12} sx={{ paddingTop: "50%" }}>
                <a href="https://www.trustpilot.com/review/www.toptutors.com" style={{ textDecoration: "none" }}>
                  <TrustpilotWidget></TrustpilotWidget>
                </a>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Grid>
      <Grid item lg={8} xs={12}>
        <Box
          sx={{
            height: "100vh",
          }}
        >
          <div style={{ textAlign: "right" }}>
            {/* {activeStep === 4 ? (
              <Button
                sx={{
                  color: '#000000',
                  border: '1px solid #000000',
                  marginRight: '3%',
                  // We could remove margin here, but I think it looks better with margin.
                }}
                onClick={() => {
                  setActiveStep(activeStep + 1);
                }}
                variant="outlined"
                size="small"
              >
                Skip
              </Button>
            ) : (
              <></>
            )} */}
            <LanguagePopover />
          </div>
          <MobileStepper
            variant="progress"
            steps={steps.length}
            position="static"
            activeStep={activeStep}
            sx={{
              maxWidth: 400,
              flexGrow: 1,
              textAlign: "center",
              margin: "auto",
              marginTop: "2.5%",
            }}
            nextButton={
              activeStep === 5 || activeStep == 2 || activeStep == 1 ? (
                <Button color="warning" variant="contained" size="small" onClick={handleNext} sx={{ margin: "auto" }}>
                  {`${translate("register.continueButton")}`}
                  {theme.direction === "rtl" ? <Iconify icon={"mdi:arrow-left-thick"} /> : <Iconify icon={"mdi:arrow-right-thick"} />}
                </Button>
              ) : (
                <>
                  <div style={{ width: "65px", height: "30px", margin: "auto" }}></div>
                </>
              )
            }
            backButton={
              activeStep !== 0 && activeStep !== 7 ? (
                <Button color="warning" variant="contained" size="small" onClick={handleBack} disabled={activeStep === 0} sx={{ margin: "auto" }}>
                  {theme.direction === "rtl" ? <Iconify icon={"mdi:arrow-right-thick"} /> : <Iconify icon={"mdi:arrow-left-thick"} />}
                  {`${translate("register.back")}`}
                </Button>
              ) : (
                <>
                  <div style={{ width: "65px", height: "30px", margin: "auto" }}></div>
                </>
              )
            }
          />
          {!!errors.afterSubmit && (
            <Alert severity="error" sx={{ textAlign: "right", bgcolor: "grey", width: "400px" }}>
              Ups! Der opstod en fejl. Prøv igen. 🔄
            </Alert>
          )}
          <Typography sx={{ marginTop: "2%", textAlign: "center" }} color={theme.palette.common.black} variant="h3" key={steps[activeStep].label}>
            {steps[activeStep].label}
          </Typography>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2.5}>
              {steps.map((step, index: number) => {
                return (
                  activeStep === index && (
                    <Slide direction="left" in={activeStep === index} mountOnEnter unmountOnExit timeout={{ enter: 500, exit: 0 }}>
                      <Step key={step.label}>{step.field}</Step>
                    </Slide>
                  )
                );
              })}
            </Stack>
          </FormProvider>
          <Logo
            sx={{
              height: "50px",
              position: "absolute",
              right: 10,
              bottom: 5,
              color: theme.palette.common.black,
              ml: 5, // adjust this value as needed for left margin
              "@media (max-width: 1200px)": {
                display: "none",
              },
            }}
          />
        </Box>
      </Grid>
    </Grid>
  );
}
