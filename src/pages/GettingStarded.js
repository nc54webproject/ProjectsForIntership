import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Divider,
  Grid,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import CircularProgress from '@mui/material/CircularProgress';
import '../styles/LandingPage.css';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import Logo from '../images/robot-with-tablet.jpg';
import { signInWithGoogle } from '../googleAuth';

function GettingStarded() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Logged In Successfully');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="GettingStarted">
      <div className="GettingStartedCard LogoCard">
        <img src={Logo} alt="MyChat" className="LoginImage" />
      </div>
      <div className="GettingStartedCard loginCard">
        <h1>MyChat Clone</h1>
        <Card sx={{ width: 500, pt: 2 }} style={{ boxShadow: 'none' }}>
          <CardHeader
            title="Sign In"
            titleTypographyProps={{
              align: 'center',
              fontWeight: 'bold',
              fontSize: 24,
              textTransform: 'uppercase',
            }}
          />
          <CardContent>
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
                sx={{ my: 1 }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                  }
                  label="Remember me"
                />
                <Button size="small">Forgot password?</Button>
              </Grid>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                disabled={isLoading}
                sx={{ mt: 1, mb: 2, p: 2 }}
              >
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>

              <Divider sx={{ my: 2 }}>OR</Divider>

              <Grid container spacing={2}>
                <Grid item xs={6} flex={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    onClick={signInWithGoogle}
                  >
                    Google
                  </Button>
                </Grid>
              </Grid>

              <Typography align="center" variant="body2" sx={{ mt: 2 }}>
                Don’t have an account?{' '}
                <Button size="small" onClick={handleSignUpClick}>
                  Sign Up
                </Button>
              </Typography>
              <Divider sx={{ my: 2 }}></Divider>
            </form>
          </CardContent>
        </Card>
        <div className="loginCardFeature">
          <p>What you'll get:</p>
          <span>
            <Check color="green" /> Visual flow builder with drag & drop
          </span>
          <span>
            <Check color="green" /> Multi-platform deployment (Web, WhatsApp,
            Messenger)
          </span>
          <span>
            <Check color="green" />
            Real-time analytics and insights
          </span>
          <span>
            <Check color="green" /> Visual flow builder with drag & drop
          </span>{' '}
          <span>
            <Check color="green" /> Cloud storage and collaboration
          </span>
        </div>
      </div>
    </div>
  );
}

export default GettingStarded;
