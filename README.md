# The Chest game assignment 🤓

To **install all node_modules** dependencies run:

```
npm install
```

**To bundle** the game to **/dist** folder run:

```
npm run build
```

Or you can **start the live server** and
watch it in your browser at **localhost:8080**

Just run:

```
npm run dev
```

Also check out the **demo:**

https://misterkubik.github.io/chestgame

#Gameplay 🤘

The game contains a play button and 6 chests.

At the initial state, the play button is enabled while the chests are disabled.

When pressing on the play button:
1) **Play button** becomes disabled.

2) All chests become interactive.

When clicking on a **chest**:
1) All other elements in the game become disabled.
2) The game randomly determine rather the chest is a winner with 1:6 chance.
3) If the **chest is empty** chances of the regular or bonus win increase each time.
4) If the **chest is a regular winner**, you will see appropriate animation and next chances will reset back to 1:6.
5) If the **chest is a bonus winner**, you will be redirected to bonus screen and next chances will reset back to 1:6.
6) On **bonus screen** press **"CONFIRM"** button to get back to the **main game screen**.

If all chests are opened, **play button** becomes enable again. Press it to start over.

