from .data import Vector2, ObjectState

class Paddle():
    size = Vector2(7, 45)
    speed = 250
    default_color_order = ['#08B393', '#CF2350', '#E37144', '#2A86BB', '#F6B20D', '#8E92B9']

    def __init__(self, x, y, player_num):
        self.pos = Vector2(x, y)
        self.player_num = player_num
        self.color_idx = 0
        self.move_functions = [self.move_up, self.move_down]
        self.color_shift_functions = [self.shift_color_left, self.shift_color_right]

    def move_up(self, dt):
        self.pos.y -= Paddle.speed * dt

    def move_down(self, dt):
        self.pos.y += Paddle.speed * dt

    def shift_color_left(self):
        if self.color_idx == 0:
            self.color_idx = 5
        else:
            self.color_idx -= 1

    def shift_color_right(self):
        if self.color_idx == 5:
            self.color_idx = 0
        else:
            self.color_idx += 1

    def tick(self, game_info, dt):
        states = ObjectState('paddle')
        states.append(self.pos, 0.0)

        player_input = game_info.player_inputs[self.player_num - 1]
        if player_input.get_input('up'):
            self.move_functions[0](dt)

        if player_input.get_input('down'):
            self.move_functions[1](dt)

        if player_input.get_input('left'):
            self.color_shift_functions[0]()
            game_info.add_color_switch(self.player_num)
            player_input.set_input('left', False)

        if player_input.get_input('right'):
            self.color_shift_functions[1]()
            game_info.add_color_switch(self.player_num)
            player_input.set_input('right', False)

        # clamp pos
        self.pos.y = min(max(self.pos.y, 0), game_info.game_size.y - self.size.y)

        states.append(self.pos, 1.0, {
            'player_num': self.player_num,
            'color': Paddle.default_color_order[self.color_idx],
            'color_idx': self.color_idx,
            'powerup_charge_num': game_info.powerup_charge_num,
            'is_default_color_order': True,
            'size': {
                'x': self.size.x,
                'y': self.size.y
            }
        })
        return states
